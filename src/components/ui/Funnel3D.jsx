import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { prepareFunnelData } from '../../services/funnel3d'

export default function Funnel3D({ data, stages, onStageClick }) {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const [selectedStage, setSelectedStage] = useState(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8fafc)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    )
    camera.position.set(0, 5, 15)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.enableZoom = true
    controls.enablePan = false

    // Create funnel
    const funnelGroup = new THREE.Group()
    const processedData = prepareFunnelData(data || [])
    
    // Materials
    const materials = {
      primary: new THREE.MeshPhongMaterial({ 
        color: 0x38BEBA,
        transparent: true,
        opacity: 0.8,
        shininess: 100
      }),
      highlight: new THREE.MeshPhongMaterial({ 
        color: 0xFF9F1C,
        transparent: true,
        opacity: 0.9,
        shininess: 100
      }),
      wireframe: new THREE.MeshBasicMaterial({ 
        color: 0x2DA8A5,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      })
    }

    // Create funnel stages
    const stageElements = []
    processedData.forEach((stage, index) => {
      const radius = Math.max(1, 6 - (index * 1.2))
      const height = 3
      
      // Main cone
      const geometry = new THREE.ConeGeometry(radius, height, 32)
      const cone = new THREE.Mesh(geometry, materials.primary.clone())
      
      cone.position.set(stage.position.x, stage.position.y, stage.position.z)
      cone.castShadow = true
      cone.receiveShadow = true
      cone.userData = { 
        stageIndex: index, 
        stageName: stage.name,
        count: stage.count,
        originalMaterial: materials.primary.clone()
      }

      // Wireframe outline
      const wireframe = new THREE.Mesh(geometry, materials.wireframe)
      wireframe.position.copy(cone.position)
      wireframe.scale.setScalar(1.02)

      // Text label
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 512
      canvas.height = 256
      
      context.fillStyle = '#2A3439'
      context.font = 'bold 48px Inter, sans-serif'
      context.textAlign = 'center'
      context.fillText(stage.name, 256, 80)
      context.font = '36px Inter, sans-serif'
      context.fillText(`${stage.count.toLocaleString()}`, 256, 140)
      context.fillStyle = '#38BEBA'
      context.fillText('visitors', 256, 190)

      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.MeshBasicMaterial({ 
        map: texture, 
        transparent: true,
        alphaTest: 0.1
      })
      const labelGeometry = new THREE.PlaneGeometry(4, 2)
      const label = new THREE.Mesh(labelGeometry, labelMaterial)
      label.position.set(stage.position.x, stage.position.y + height + 1, stage.position.z)
      label.lookAt(camera.position)

      funnelGroup.add(cone)
      funnelGroup.add(wireframe)
      funnelGroup.add(label)
      
      stageElements.push({ cone, wireframe, label })
    })

    scene.add(funnelGroup)

    // Raycaster for interactions
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseClick = (event) => {
      const rect = mountRef.current.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(
        stageElements.map(el => el.cone)
      )

      if (intersects.length > 0) {
        const clicked = intersects[0].object
        const stageData = clicked.userData
        
        setSelectedStage(stageData.stageIndex)
        onStageClick?.(stageData)

        // Visual feedback
        stageElements.forEach((el, index) => {
          if (index === stageData.stageIndex) {
            el.cone.material = materials.highlight.clone()
            el.cone.scale.setScalar(1.1)
          } else {
            el.cone.material = el.cone.userData.originalMaterial.clone()
            el.cone.scale.setScalar(1)
          }
        })
      }
    }

    const onMouseMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(
        stageElements.map(el => el.cone)
      )

      // Hover effects
      stageElements.forEach((el, index) => {
        if (intersects.some(intersect => intersect.object === el.cone)) {
          mountRef.current.style.cursor = 'pointer'
          if (selectedStage !== index) {
            el.cone.scale.setScalar(1.05)
          }
        } else {
          if (selectedStage !== index) {
            el.cone.scale.setScalar(1)
          }
        }
      })

      if (intersects.length === 0) {
        mountRef.current.style.cursor = 'default'
      }
    }

    mountRef.current.addEventListener('click', onMouseClick)
    mountRef.current.addEventListener('mousemove', onMouseMove)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      
      // Gentle rotation
      funnelGroup.rotation.y += 0.002
      
      // Floating animation for selected stage
      if (selectedStage !== null && stageElements[selectedStage]) {
        const time = Date.now() * 0.003
        stageElements[selectedStage].cone.position.y = 
          processedData[selectedStage].position.y + Math.sin(time) * 0.2
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    mountRef.current.appendChild(renderer.domElement)

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      mountRef.current?.removeEventListener('click', onMouseClick)
      mountRef.current?.removeEventListener('mousemove', onMouseMove)
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      // Cleanup
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
      
      renderer.dispose()
    }
  }, [data, stages, selectedStage, onStageClick])

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden funnel-3d">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Info overlay */}
      {selectedStage !== null && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h3 className="font-semibold text-genie-dark">
            {stages?.[selectedStage]?.name || `Stage ${selectedStage + 1}`}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {stages?.[selectedStage]?.count?.toLocaleString() || 0} visitors
          </p>
          <div className="text-xs text-genie-teal mt-2">
            Click and drag to rotate • Scroll to zoom
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white/80 rounded px-2 py-1">
        Interactive 3D Funnel
      </div>
    </div>
  )
}
