import FirebaseService from './client'

export class CampaignService {
  static async getAllCampaigns() {
    return await FirebaseService.getAll('campaigns')
  }

  static async getCampaignById(id) {
    return await FirebaseService.getById('campaigns', id)
  }

  static async createCampaign(campaignData) {
    return await FirebaseService.create('campaigns', campaignData)
  }

  static async updateCampaign(id, campaignData) {
    return await FirebaseService.update('campaigns', id, campaignData)
  }

  static async deleteCampaign(id) {
    return await FirebaseService.delete('campaigns', id)
  }

  static async getCampaignsByStatus(status) {
    return await FirebaseService.query('campaigns', [
      { field: 'status', operator: '==', value: status }
    ])
  }

  static async getActiveCampaigns() {
    return await FirebaseService.query('campaigns', [
      { field: 'status', operator: '==', value: 'active' }
    ], { field: 'created_at', direction: 'desc' })
  }

  static async updateCampaignHealth(id, healthScore) {
    return await FirebaseService.update('campaigns', id, { 
      health_score: healthScore,
      last_health_check: new Date()
    })
  }
}

export default CampaignService
