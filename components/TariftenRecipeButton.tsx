"use client";

import { useState, useEffect } from 'react';
import { checkTariftenRecipe, generateTariftenRecipe } from '@/lib/api';
import TariftenIcon from './icons/TariftenIcon';

interface Recipe {
  id: number;
  title: string;
  slug: string;
  url: string;
  image?: string;
}

interface Props {
  dietId: number;
  mealId: string;
  onRecipeCreated?: (recipe: Recipe) => void;
  onPointsEarned?: (points: number, message: string) => void;
}

export default function TariftenRecipeButton({ 
  dietId, 
  mealId, 
  onRecipeCreated,
  onPointsEarned
}: Props) {
  const [recipeData, setRecipeData] = useState<{slug: string; url: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sayfa yüklendiğinde tarif var mı kontrol et
  useEffect(() => {
    async function checkExisting() {
      try {
        const result = await checkTariftenRecipe(dietId, mealId);
        if (result.exists && result.slug) {
          const tariftenUrl = process.env.NEXT_PUBLIC_TARIFTEN_URL || 'https://tariften.com';
          setRecipeData({
            slug: result.slug,
            url: result.url || `${tariftenUrl}/recipe/${result.slug}`
          });
        }
      } catch (e) {
        console.error('Tarif kontrolü hatası:', e);
      } finally {
        setChecking(false);
      }
    }
    checkExisting();
  }, [dietId, mealId]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateTariftenRecipe({
        diet_id: dietId,
        meal_id: mealId
      });
      
      if (result.success && result.recipe) {
        setRecipeData({
          slug: result.recipe.slug,
          url: result.recipe.url
        });
        
        if (onRecipeCreated) {
          onRecipeCreated(result.recipe);
        }
        
        if (result.points_earned && onPointsEarned) {
          onPointsEarned(result.points_earned, result.message || 'Tarif oluşturuldu!');
        }
      } else {
        setError(result.message || 'Tarif oluşturulamadı');
      }
    } catch (e) {
      const error = e as Error;
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Yükleniyor durumu
  if (checking) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Tarif varsa "Tarife Git" göster
  if (recipeData) {
    return (
      <a 
        href={recipeData.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition group"
        title="Tariften'de tarifi görüntüle"
      >
        <TariftenIcon className="w-4 h-4" />
        <span className="group-hover:underline">Tarife Git</span>
        <i className="fa-solid fa-arrow-up-right-from-square text-[10px] opacity-50"></i>
      </a>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <button
        onClick={handleGenerate}
        className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition"
        title={error}
      >
        <i className="fa-solid fa-triangle-exclamation"></i>
        <span>Tekrar Dene</span>
      </button>
    );
  }

  // Tarif yoksa "Tarif Oluştur" göster
  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-bold text-orange-500 hover:text-orange-600 transition disabled:opacity-50 disabled:cursor-wait group"
      title="Bu öğün için Tariften'de AI tarif oluştur"
    >
      <TariftenIcon className="w-4 h-4" />
      {loading ? (
        <>
          <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Oluşturuluyor...</span>
        </>
      ) : (
        <>
          <span className="group-hover:underline">Tarif Oluştur</span>
          <i className="fa-solid fa-wand-magic-sparkles text-[10px] opacity-70"></i>
        </>
      )}
    </button>
  );
}
