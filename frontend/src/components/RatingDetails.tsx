/**
 * RatingDetails Component
 * Displays detailed rating information with rater's profile link
 */

import { Link } from "react-router-dom";
import StarIcon from "@mui/icons-material/Star";
import PersonIcon from "@mui/icons-material/Person";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import type { OrderRating, UserDto } from "../features/user/userService";
import { getRelativeTime } from "../utils/dateUtils";

interface RatingDetailsProps {
  rating: OrderRating;
}

export default function RatingDetails({ rating }: RatingDetailsProps) {
  const rater: UserDto = rating.fromUser;
  const isPositive = rating.value === 1;
  const ratingDate = new Date(rating.createdAt);

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Rater Avatar */}
          <Link
            to={`/users/${rater.id}/profile`}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {rater.avatarUrl ? (
              <img
                src={rater.avatarUrl}
                alt={rater.fullName || "User"}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200">
                <PersonIcon className="text-gray-400 text-2xl" />
              </div>
            )}
          </Link>

          {/* Rater Info */}
          <div>
            <Link
              to={`/users/${rater.id}/profile`}
              className="font-semibold text-gray-900 hover:text-primary transition-colors flex items-center gap-2"
            >
              {rater.fullName || rater.email || "Anonymous User"}
              {rater.isEmailVerified && (
                <VerifiedUserIcon className="text-blue-500" style={{ fontSize: 18 }} />
              )}
            </Link>
            {rater.ratingPercent !== null && rater.ratingPercent !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <StarIcon className="text-yellow-400" style={{ fontSize: 14 }} />
                <span className="text-xs text-gray-600">
                  {rater.ratingPercent.toFixed(0)}% positive
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rating Value */}
        <div
          className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold ${
            isPositive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isPositive ? (
            <>
              <ThumbUpIcon style={{ fontSize: 18 }} />
              <span>Positive</span>
            </>
          ) : (
            <>
              <ThumbDownIcon style={{ fontSize: 18 }} />
              <span>Negative</span>
            </>
          )}
        </div>
      </div>

      {/* Rating Comment */}
      {rating.comment && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">{rating.comment}</p>
        </div>
      )}

      {/* Rating Date */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {getRelativeTime(ratingDate)}
        </span>
      </div>
    </div>
  );
}
