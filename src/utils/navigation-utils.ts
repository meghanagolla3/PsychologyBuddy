import { SearchParamsUtils, ChatSearchParams } from '../lib/ai/search-params'

export class NavigationUtils {
  /**
   * Navigate to chat with mood data
   */
  static navigateToChat(
    router: any,
    data: ChatSearchParams
  ): void {
    const params = SearchParamsUtils.createChatParams(data)
    router.push(`/students/chat${params ? `?${params}` : ''}`)
  }

  /**
   * Navigate to login
   */
  static navigateToLogin(router: any): void {
    router.push('/login')
  }

  /**
   * Navigate to mood checkin
   */
  static navigateToMoodCheckin(router: any): void {
    router.push('/students/mood-checkin')
  }

  /**
   * Navigate to dashboard
   */
  static navigateToDashboard(router: any): void {
    router.push('/dashboard/student')
  }
}
