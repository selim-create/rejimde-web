"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchComments, postComment, toggleLikeComment, CommentData } from "@/lib/comment-service";
import { ReviewFormData, FilterState, ReviewStatsData, SuccessStory, CommunityImpactData } from "@/types/expert-reviews";
import ReviewStats from "./ReviewStats";
import ReviewFilters from "./ReviewFilters";
import FeaturedReviews from "./FeaturedReviews";
import SuccessStories from "./SuccessStories";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import CommunityImpact from "./CommunityImpact";

interface ExpertReviewsContainerProps {
  expertId: number;
  expertSlug?: string;
}

// --- MODAL ---
const AlertModal = ({ 
  isOpen, 
  title, 
  message, 
  type, 
  onClose 
}: { 
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning';
  onClose: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className={`absolute top-0 left-0 w-full h-2 ${
          type === 'success' ? 'bg-green-500' : 
          type === 'error' ? 'bg-red-500' : 
          'bg-yellow-500'
        }`}></div>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${
          type === 'success' ? 'bg-green-100 text-green-600' : 
          type === 'error' ? 'bg-red-100 text-red-600' : 
          'bg-yellow-100 text-yellow-600'
        }`}>
          <i className={`fa-solid ${
            type === 'success' ? 'fa-check' : 
            type === 'error' ? 'fa-circle-exclamation' : 
            'fa-triangle-exclamation'
          } text-3xl`}></i>
        </div>
        <h3 className="text-xl font-black text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm mb-6 font-bold leading-relaxed">{message}</p>
        <button 
          onClick={onClose} 
          className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-extrabold text-sm transition shadow-lg"
        >
          Tamam
        </button>
      </div>
    </div>
  );
};

export default function ExpertReviewsContainer({ expertId, expertSlug }: ExpertReviewsContainerProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [filteredComments, setFilteredComments] = useState<CommentData[]>([]);
  const [stats, setStats] = useState<ReviewStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ 
    isLoggedIn: boolean;
    name: string;
    slug: string;
    avatar: string;
    role: string;
    level?: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedLocal, setHasSubmittedLocal] = useState(false);
  const [modal, setModal] = useState<{ 
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  }>({ isOpen: false, title: '', message: '', type: 'success' });
  
  const [filters, setFilters] = useState<FilterState>({
    goalTag: null,
    programType: null,
    ratingMin: 0,
    verifiedOnly: false,
    withStory: false,
  });

  // Mock data for new features (will be replaced with real API data)
  const [featuredReviews, setFeaturedReviews] = useState<CommentData[]>([]);
  const [successStories] = useState<SuccessStory[]>([]);
  const [communityImpact] = useState<CommunityImpactData | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        setUser({
          isLoggedIn: true,
          name: localStorage.getItem('user_name') || 'Kullanıcı',
          slug: localStorage.getItem('user_slug') || '',
          avatar: localStorage.getItem('user_avatar') || `https://api.dicebear.com/9.x/avataaars/svg?seed=User`,
          role: localStorage.getItem('user_role') || 'rejimde_user',
          level: parseInt(localStorage.getItem('user_level') || '1')
        });
      }
    }
    loadData();
  }, [expertId]);

  // Filter comments when filters change
  useEffect(() => {
    let filtered = [...comments];

    // Filter by rating
    if (filters.ratingMin > 0) {
      filtered = filtered.filter(c => (c.rating || 0) >= filters.ratingMin);
    }

    // Filter by verified
    if (filters.verifiedOnly) {
      filtered = filtered.filter(c => c.author.is_verified);
    }

    // Filter by goal tag
    if (filters.goalTag) {
      filtered = filtered.filter(c => c.goalTag === filters.goalTag);
    }

    // Filter by program type
    if (filters.programType) {
      filtered = filtered.filter(c => c.programType === filters.programType);
    }

    // Filter by success story
    if (filters.withStory) {
      filtered = filtered.filter(c => c.successStory && c.successStory.trim().length > 0);
    }

    setFilteredComments(filtered);
  }, [comments, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchComments(expertId, 'expert');
      if (data) {
        const allComments = data.comments || [];
        setComments(allComments);
        
        // Extract featured reviews based on is_featured flag
        const featured = allComments
          .filter(c => c.is_featured === true)
          .slice(0, 3); // Limit to 3 featured reviews
        setFeaturedReviews(featured);
        
        // Set stats with extended data
        if (data.stats) {
          setStats({
            average: data.stats.average || 0,
            total: data.stats.total || 0,
            distribution: data.stats.distribution || {},
            // API'den gelen gerçek veriler
            verifiedClientCount: data.stats.verified_client_count || 0,
            averageProcessDuration: data.stats.average_process_weeks || 0,
            successRate: data.stats.recommend_rate || 0, // would_recommend oranı
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'warning') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const isProfileOwner = user?.isLoggedIn && expertSlug && user?.slug === expertSlug;
  
  const hasReviewed = hasSubmittedLocal || comments.some(c => 
    c.parent === 0 && (
      (user?.slug && c.author.slug === user.slug) || 
      (c.author.name === user?.name)
    )
  );

  const handleSubmitReview = async (formData: ReviewFormData) => {
    if (!user?.isLoggedIn) {
      showAlert("Giriş Gerekli", "Değerlendirme yapmak için giriş yapmalısınız.", "warning");
      return;
    }
    
    if (isProfileOwner) {
      showAlert("Hata", "Kendi profilinize değerlendirme yapamazsınız.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postComment({
        post: expertId,
        content: formData.content,
        context: 'expert',
        rating: formData.rating,
        isAnonymous: formData.isAnonymous,
        goalTag: formData.goalTag,
        programType: formData.programType,
        processWeeks: formData.processWeeks,
        wouldRecommend: formData.wouldRecommend,
        hasSuccessStory: formData.hasSuccessStory,
        successStory: formData.successStory,
      });
      
      if (res.success) {
        setHasSubmittedLocal(true);
        showAlert("Başarılı", res.message || "Yorumunuz alındı.", "success");
        loadData();
      } else {
        showAlert("Hata", res.message || "Bir hata oluştu.", "error");
      }
    } catch (error: any) {
      showAlert("Hata", error.message || "Yorum gönderilirken bir hata oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: number) => {
    if (!user?.isLoggedIn) {
      showAlert("Giriş Gerekli", "Beğenmek için giriş yapmalısın.", "warning");
      return;
    }
    
    setComments(prev => {
      const updateLike = (list: CommentData[]): CommentData[] => {
        return list.map(c => {
          if (c.id === commentId) {
            const isLiked = !c.is_liked;
            return { ...c, is_liked: isLiked, likes_count: c.likes_count + (isLiked ? 1 : -1) };
          }
          if (c.replies) {
            return { ...c, replies: updateLike(c.replies) };
          }
          return c;
        });
      };
      return updateLike(prev);
    });

    try {
      await toggleLikeComment(commentId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReply = async (commentId: number, replyContent: string) => {
    if (!user?.isLoggedIn) {
      showAlert("Giriş Gerekli", "Yanıtlamak için giriş yapmalısınız.", "warning");
      return;
    }
    
    if (!replyContent.trim()) {
      showAlert("Eksik Bilgi", "Lütfen bir yanıt yazın.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await postComment({
        post: expertId,
        content: replyContent,
        context: 'expert',
        parent: commentId
      });
      
      if (res.success) {
        showAlert("Başarılı", res.message || "Yanıtınız gönderildi.", "success");
        loadData();
      } else {
        showAlert("Hata", res.message || "Bir hata oluştu.", "error");
      }
    } catch (error: any) {
      showAlert("Hata", error.message || "Bir hata oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-nunito">
      <AlertModal 
        isOpen={modal.isOpen} 
        title={modal.title} 
        message={modal.message} 
        type={modal.type} 
        onClose={closeModal} 
      />
      
      {/* Stats Section */}
      <ReviewStats stats={stats} />

      {/* Community Impact */}
      {communityImpact && <CommunityImpact data={communityImpact} />}

      {/* Featured Reviews */}
      {featuredReviews.length > 0 && <FeaturedReviews reviews={featuredReviews} />}

      {/* Success Stories */}
      {successStories.length > 0 && <SuccessStories stories={successStories} />}

      {/* Review Form */}
      {!user?.isLoggedIn && (
        <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-bold mb-2">Yorum yapmak ve puan kazanmak için</p>
          <Link href="/login" className="text-indigo-600 font-black hover:underline">
            Giriş Yapın
          </Link>
        </div>
      )}

      {user?.isLoggedIn && !isProfileOwner && (
        hasReviewed ? (
          <div className="bg-green-50 border-2 border-green-100 p-6 rounded-[2rem] text-center shadow-sm animate-in fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="text-lg font-black text-green-800 mb-1">Değerlendirmeniz Alındı</h3>
            <p className="text-green-600 font-bold text-sm">
              Teşekkürler! Deneyiminiz uzman onayı sonrası yayınlanacaktır.
            </p>
          </div>
        ) : (
          <ReviewForm 
            user={user} 
            onSubmit={handleSubmitReview} 
            isSubmitting={isSubmitting} 
          />
        )
      )}

      {/* Filters */}
      <ReviewFilters filters={filters} onFilterChange={setFilters} />

      {/* Reviews List */}
      <ReviewList
        reviews={filteredComments}
        expertSlug={expertSlug}
        onLike={handleLike}
        onReply={handleReply}
        user={user}
        isLoading={isLoading}
      />
    </div>
  );
}
