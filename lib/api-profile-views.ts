/**
 * Profile View Tracking API Functions
 * Handles tracking and retrieving profile view statistics for rejimde_pro members
 */

// Base API URL - using the same pattern as api.ts
const API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://api.rejimde.com/wp-json';

/**
 * Track a profile view
 * Creates a session ID if one doesn't exist and sends tracking data to the backend
 * Only tracks views for claimed (is_claimed === true) expert profiles
 */
export async function trackProfileView(expertSlug: string): Promise<void> {
  try {
    // Create or retrieve session ID from localStorage
    let sessionId = localStorage.getItem('rejimde_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('rejimde_session_id', sessionId);
    }

    // Add JWT token if available - this way members are recognized
    const token = localStorage.getItem('jwt_token');
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json' 
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Send tracking request to backend
    await fetch(`${API_URL}/rejimde/v1/profile-views/track`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        expert_slug: expertSlug,
        session_id: sessionId
      }),
      credentials: 'include'
    });
  } catch (error) {
    // Fail silently - tracking should not disrupt user experience
    console.error('Profile view tracking failed:', error);
  }
}

/**
 * Profile view statistics interface
 */
export interface ProfileViewStats {
  this_week: number;
  this_month: number;
  total: number;
  member_views: number;
  guest_views: number;
}

/**
 * Get profile view statistics for the authenticated user
 * Requires authentication token
 */
export async function getMyProfileViewStats(token: string): Promise<ProfileViewStats> {
  try {
    const response = await fetch(`${API_URL}/rejimde/v1/profile-views/my-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    const json = await response.json();

    if (json.status === 'success' && json.data) {
      return {
        this_week: json.data.this_week || 0,
        this_month: json.data.this_month || 0,
        total: json.data.total || 0,
        member_views: json.data.member_views || 0,
        guest_views: json.data.guest_views || 0
      };
    }

    // Return default values if request fails
    return {
      this_week: 0,
      this_month: 0,
      total: 0,
      member_views: 0,
      guest_views: 0
    };
  } catch (error) {
    console.error('Failed to fetch profile view stats:', error);
    return {
      this_week: 0,
      this_month: 0,
      total: 0,
      member_views: 0,
      guest_views: 0
    };
  }
}

/**
 * Profile view activity item interface
 */
export interface ProfileViewActivity {
  id: number;
  viewed_at: string;
  is_member: boolean;
  viewer: {
    id: number;
    name: string;
    avatar: string;
  } | null;
}

/**
 * Response metadata interface
 */
export interface ProfileViewActivityMeta {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}

/**
 * Get profile view activity (list of viewers)
 * Requires authentication token
 * Supports pagination
 */
export async function getProfileViewActivity(
  token: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ data: ProfileViewActivity[]; meta: ProfileViewActivityMeta }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });

    const response = await fetch(`${API_URL}/rejimde/v1/profile-views/activity?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    const json = await response.json();

    if (json.status === 'success' && json.data) {
      return {
        data: json.data,
        meta: {
          current_page: json.meta?.page || 1,
          total_pages: json.meta?.total_pages || 1,
          total_items: json.meta?.total || 0,
          per_page: json.meta?.per_page || perPage
        }
      };
    }

    // Return empty data if request fails
    return {
      data: [],
      meta: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        per_page: perPage
      }
    };
  } catch (error) {
    console.error('Failed to fetch profile view activity:', error);
    return {
      data: [],
      meta: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        per_page: perPage
      }
    };
  }
}
