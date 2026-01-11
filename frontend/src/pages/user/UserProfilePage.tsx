/**
 * UserProfilePage Component
 * Displays public user profile information
 * Supports masked view for highest bidders
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { userService, type UserDto } from "../../features/user/userService";
import PersonIcon from "@mui/icons-material/Person";
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userProfile, setUserProfile] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const masked = searchParams.get("masked") === "true";

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profile = await userService.getUserProfile(
          parseInt(userId),
          masked
        );
        setUserProfile(profile);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load user profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, masked]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">
            {error || "User profile not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowBackIcon fontSize="small" />
          <span>Back</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {userProfile.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.fullName || "User"}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                    <PersonIcon className="text-gray-400 text-5xl" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {userProfile.fullName || "Anonymous User"}
                  </h1>
                  {userProfile.isEmailVerified && !masked && (
                    <VerifiedUserIcon className="text-blue-500" />
                  )}
                  {masked && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                      Protected Profile
                    </span>
                  )}
                </div>

                {/* Rating */}
                {userProfile.ratingPercent !== null &&
                  userProfile.ratingPercent !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <StarIcon className="text-yellow-400" />
                      <span className="text-lg font-semibold text-gray-700">
                        {userProfile.ratingPercent.toFixed(1)}% positive rating
                      </span>
                    </div>
                  )}

                {/* Member Since */}
                {userProfile.createdAt && (
                  <div className="flex items-center gap-2 mt-3 text-gray-600">
                    <CalendarTodayIcon fontSize="small" />
                    <span className="text-sm">
                      Member since{" "}
                      {new Date(userProfile.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Profile Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              {!masked && userProfile.email && (
                <div className="flex items-start gap-3">
                  <EmailIcon className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-gray-900 font-medium">
                      {userProfile.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {!masked && userProfile.phoneNumber && (
                <div className="flex items-start gap-3">
                  <PhoneIcon className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                    <p className="text-gray-900 font-medium">
                      {userProfile.phoneNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-start gap-3">
                <VerifiedUserIcon className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Account Status</p>
                  <p className="text-gray-900 font-medium capitalize">
                    {userProfile.status?.toLowerCase() || "Active"}
                  </p>
                </div>
              </div>

              {/* Roles */}
              {userProfile.roles && userProfile.roles.length > 0 && (
                <div className="flex items-start gap-3">
                  <PersonIcon className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.roles.map((role, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Masked Profile Notice */}
            {masked && (
              <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Privacy Notice:</strong> This is a protected profile
                  for privacy reasons. Some information has been masked to
                  protect the user's identity.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
