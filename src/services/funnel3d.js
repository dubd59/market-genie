export const prepareFunnelData = (events) => {
  // Competitive Edge: Converts flat analytics data to interactive 3D coordinates
  const stages = [
    { name: 'Visitors', count: 0, type: 'page_view' },
    { name: 'Leads', count: 0, type: 'form_submit' },
    { name: 'Qualified', count: 0, type: 'lead_qualified' },
    { name: 'Customers', count: 0, type: 'purchase' }
  ]

  // Process events to count stages
  if (events && Array.isArray(events)) {
    events.forEach(event => {
      const stage = stages.find(s => s.type === event.type || event.event_type)
      if (stage) {
        stage.count++
      }
    })
  }

  // Ensure funnel logic (each stage <= previous stage)
  for (let i = 1; i < stages.length; i++) {
    if (stages[i].count > stages[i - 1].count) {
      stages[i].count = stages[i - 1].count
    }
  }

  // Convert to 3D coordinates and add visual properties
  return stages.map((stage, index) => {
    const yPosition = -index * 3 // Stack vertically
    const baseRadius = 5
    const radiusReduction = index * 0.8
    const radius = Math.max(1, baseRadius - radiusReduction)
    
    return {
      ...stage,
      position: {
        x: 0,
        y: yPosition,
        z: 0
      },
      radius: radius,
      scale: 1 + (stage.count / Math.max(stages[0].count, 100)) * 0.5, // Dynamic sizing based on volume
      conversionRate: index > 0 ? (stage.count / stages[index - 1].count) * 100 : 100,
      dropOff: index > 0 ? stages[index - 1].count - stage.count : 0,
      color: getStageColor(index, stage.count, stages[0].count)
    }
  })
}

// Generate colors based on performance
const getStageColor = (index, count, totalVisitors) => {
  const conversionRate = count / totalVisitors
  
  // Color coding based on conversion performance
  if (conversionRate > 0.5) return '#10B981' // Green - excellent
  if (conversionRate > 0.2) return '#38BEBA' // Teal - good
  if (conversionRate > 0.1) return '#F59E0B' // Yellow - average
  if (conversionRate > 0.05) return '#EF4444' // Red - poor
  return '#6B7280' // Gray - very poor
}

export const calculateFunnelMetrics = (stages) => {
  if (!stages || stages.length === 0) return {}

  const metrics = {
    totalVisitors: stages[0]?.count || 0,
    totalConversions: stages[stages.length - 1]?.count || 0,
    overallConversionRate: 0,
    stageConversions: [],
    dropOffPoints: [],
    healthScore: 0
  }

  if (metrics.totalVisitors > 0) {
    metrics.overallConversionRate = (metrics.totalConversions / metrics.totalVisitors) * 100
  }

  // Calculate stage-by-stage metrics
  for (let i = 1; i < stages.length; i++) {
    const previous = stages[i - 1]
    const current = stages[i]
    
    const stageConversion = previous.count > 0 ? (current.count / previous.count) * 100 : 0
    const dropOff = previous.count - current.count
    
    metrics.stageConversions.push({
      stageName: current.name,
      conversionRate: stageConversion,
      converted: current.count,
      lost: dropOff
    })
    
    if (stageConversion < 50) { // Less than 50% conversion is a drop-off point
      metrics.dropOffPoints.push({
        stage: current.name,
        conversionRate: stageConversion,
        priority: stageConversion < 20 ? 'high' : 'medium'
      })
    }
  }

  // Calculate health score (0-100)
  const avgConversion = metrics.stageConversions.reduce((sum, stage) => sum + stage.conversionRate, 0) / metrics.stageConversions.length
  metrics.healthScore = Math.min(100, avgConversion * 2) // Scale to 100

  return metrics
}

export const generateFunnelOptimizations = (metrics) => {
  const optimizations = []

  metrics.dropOffPoints?.forEach(dropOff => {
    switch (dropOff.stage) {
      case 'Leads':
        optimizations.push({
          stage: dropOff.stage,
          priority: dropOff.priority,
          issue: 'Low visitor-to-lead conversion',
          recommendations: [
            'Improve landing page design and messaging',
            'Add compelling lead magnets (ebooks, webinars)',
            'Optimize form placement and reduce form fields',
            'Add social proof and testimonials',
            'Implement exit-intent popups'
          ],
          estimatedImpact: '15-30% improvement'
        })
        break
      
      case 'Qualified':
        optimizations.push({
          stage: dropOff.stage,
          priority: dropOff.priority,
          issue: 'Poor lead qualification process',
          recommendations: [
            'Implement lead scoring system',
            'Set up automated email nurturing sequences',
            'Create targeted content for different buyer personas',
            'Add progressive profiling to forms',
            'Use behavioral triggers for follow-up'
          ],
          estimatedImpact: '20-40% improvement'
        })
        break
      
      case 'Customers':
        optimizations.push({
          stage: dropOff.stage,
          priority: dropOff.priority,
          issue: 'Low conversion to purchase',
          recommendations: [
            'Optimize checkout process and reduce friction',
            'Add urgency and scarcity elements',
            'Implement abandoned cart recovery',
            'Offer multiple payment options',
            'Add money-back guarantees and trust signals',
            'Use retargeting campaigns for warm leads'
          ],
          estimatedImpact: '10-25% improvement'
        })
        break
      
      default:
        optimizations.push({
          stage: dropOff.stage,
          priority: dropOff.priority,
          issue: 'Conversion drop-off detected',
          recommendations: [
            'Analyze user behavior at this stage',
            'A/B test different approaches',
            'Improve messaging and value proposition',
            'Reduce friction in the process'
          ],
          estimatedImpact: '10-20% improvement'
        })
    }
  })

  return optimizations
}

// Generate sample data for demo purposes
export const generateSampleFunnelData = () => {
  return [
    { type: 'page_view', timestamp: Date.now() - 86400000, session_id: 'session1' },
    { type: 'page_view', timestamp: Date.now() - 82800000, session_id: 'session2' },
    { type: 'page_view', timestamp: Date.now() - 79200000, session_id: 'session3' },
    { type: 'page_view', timestamp: Date.now() - 75600000, session_id: 'session4' },
    { type: 'page_view', timestamp: Date.now() - 72000000, session_id: 'session5' },
    { type: 'form_submit', timestamp: Date.now() - 68400000, session_id: 'session1' },
    { type: 'form_submit', timestamp: Date.now() - 64800000, session_id: 'session3' },
    { type: 'lead_qualified', timestamp: Date.now() - 61200000, session_id: 'session1' },
    { type: 'purchase', timestamp: Date.now() - 57600000, session_id: 'session1' }
  ]
}
