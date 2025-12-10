import React from 'react';
import Icon from '../AppIcon';

const StarRating = ({ rating, onRatingChange, disabled = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className={`p-1 transition-colors duration-150 ${
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          }`}
          aria-label={`Rate ${star} out of 5 stars`}
        >
          <Icon
            name="Star"
            size={28}
            className={
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-muted-foreground'
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
