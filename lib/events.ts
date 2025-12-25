import { API_URL } from './api';

export interface EventResponse {
  status: 'success' | 'error';
  data?: {
    event_id: number;
    event_type: string;
    awarded_points_total: number;
    awarded_ledger_items: Array<{
      id: number;
      points_delta: number;
      reason: string;
      balance_after: number;
    }>;
    messages: string[];
    daily_remaining?: Record<string, number>;
    current_balance: number;
  };
  message?: string;
}

export interface SendEventParams {
  event_type: string;
  entity_type?: string;
  entity_id?: number;
  metadata?: Record<string, any>;
  source?: string;
}

/**
 * Ana event gönderme fonksiyonu
 * Tüm gamification eventleri bu fonksiyon üzerinden gönderilir
 */
export async function sendEvent(params: SendEventParams): Promise<EventResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
  
  if (!token) {
    return { status: 'error', message: 'Giriş yapmalısınız.' };
  }

  try {
    const res = await fetch(`${API_URL}/rejimde/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        event_type: params.event_type,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        metadata: params.metadata || {},
        source: params.source || 'web'
      })
    });

    const json = await res.json();
    return json;
  } catch (error) {
    console.error('sendEvent error:', error);
    return { status: 'error', message: 'Bağlantı hatası.' };
  }
}

// ═══════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS - Spesifik event tipleri için
// ═══════════════════════════════════════════════════════════

/** Login event - Kullanıcı girişinde çağrılır */
export async function sendLoginEvent() {
  return sendEvent({ event_type: 'login_success' });
}

/** Blog okuma puanı talep et */
export async function claimBlogPoints(blogId: number, isSticky: boolean = false) {
  return sendEvent({
    event_type: 'blog_points_claimed',
    entity_type: 'blog',
    entity_id: blogId,
    metadata: { is_sticky: isSticky }
  });
}

/** Diyet başlat */
export async function startDiet(dietId: number) {
  return sendEvent({
    event_type: 'diet_started',
    entity_type: 'diet',
    entity_id: dietId
  });
}

/** Diyet tamamla */
export async function completeDiet(dietId: number, dietPoints: number) {
  return sendEvent({
    event_type: 'diet_completed',
    entity_type: 'diet',
    entity_id: dietId,
    metadata: { diet_points: dietPoints }
  });
}

/** Egzersiz başlat */
export async function startExercise(exerciseId: number) {
  return sendEvent({
    event_type: 'exercise_started',
    entity_type: 'exercise',
    entity_id: exerciseId
  });
}

/** Egzersiz tamamla */
export async function completeExercise(exerciseId: number, exercisePoints: number) {
  return sendEvent({
    event_type: 'exercise_completed',
    entity_type: 'exercise',
    entity_id: exerciseId,
    metadata: { exercise_points: exercisePoints }
  });
}

/** Hesaplayıcı sonucu kaydet */
export async function saveCalculator(calculatorType: string, result: any) {
  return sendEvent({
    event_type: 'calculator_saved',
    entity_type: 'calculator',
    metadata: { calculator_type: calculatorType, result }
  });
}

/** Rating/değerlendirme gönder */
export async function submitRating(targetType: string, targetId: number, score: number) {
  return sendEvent({
    event_type: 'rating_submitted',
    entity_type: targetType,
    entity_id: targetId,
    metadata: { target_type: targetType, target_id: targetId, score }
  });
}

/** Yorum oluşturuldu */
export async function commentCreated(commentId: number, targetType: string, targetId: number) {
  return sendEvent({
    event_type: 'comment_created',
    entity_type: 'comment',
    entity_id: commentId,
    metadata: { target_type: targetType, target_id: targetId }
  });
}

/** Yorum beğenildi */
export async function likeComment(commentId: number) {
  return sendEvent({
    event_type: 'comment_liked',
    entity_type: 'comment',
    entity_id: commentId
  });
}

/** Takip kabul edildi */
export async function followAccepted(followerId: number, followingId: number) {
  return sendEvent({
    event_type: 'follow_accepted',
    entity_type: 'user',
    metadata: { follower_id: followerId, following_id: followingId }
  });
}

/** Beşlik gönderildi */
export async function sendHighfive(receiverId: number) {
  return sendEvent({
    event_type: 'highfive_sent',
    entity_type: 'user',
    entity_id: receiverId,
    metadata: { receiver_id: receiverId }
  });
}

/** Su eklendi */
export async function addWater(amountMl: number) {
  return sendEvent({
    event_type: 'water_added',
    entity_type: 'water',
    metadata: { amount_ml: amountMl, bucket_id: Date.now() }
  });
}

/** Adım loglandı */
export async function logSteps(stepsDelta: number) {
  return sendEvent({
    event_type: 'steps_logged',
    entity_type: 'steps',
    metadata: { steps_delta: stepsDelta }
  });
}

/** Öğün fotoğrafı yüklendi */
export async function uploadMealPhoto(mealId: string) {
  return sendEvent({
    event_type: 'meal_photo_uploaded',
    entity_type: 'meal',
    metadata: { meal_id: mealId }
  });
}

/** Circle'a katılım */
export async function joinedCircle(circleId: number) {
  return sendEvent({
    event_type: 'circle_joined',
    entity_type: 'circle',
    entity_id: circleId
  });
}

/** Circle oluşturuldu */
export async function createdCircle(circleId: number) {
  return sendEvent({
    event_type: 'circle_created',
    entity_type: 'circle',
    entity_id: circleId
  });
}
