import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMutation } from '@apollo/client';
import dayjs from 'dayjs';
import { Plus, Twitter, UserCheck } from 'lucide-react';
import { ToggleFollowUserDocument } from '../../../../generated/graphql';

interface AuthorModalProps {
  me: string;
  authorName: string;
  authorHandle: string;
  authorBio: string;
  authorAvatarSrc?: string;
  authorProfileLink?: string;
  memberSince: string;
  country?: string;
  location: string;
  following: boolean;
  followersCount: number;
  followingsCount: number;
  toggleFollowingState: (following: boolean) => void;
}

export default function AuthorModal({
  me,
  authorName,
  authorHandle,
  authorBio,
  authorAvatarSrc,
  authorProfileLink,
  memberSince,
  country,
  location,
  following,
  followersCount,
  followingsCount,
  toggleFollowingState,
}: AuthorModalProps) {
  const [toggleFollowing, { loading: togglingFollowing }] = useMutation(
    ToggleFollowUserDocument,
    {
      onCompleted: (data) => {
        if (data.toggleFollowUser.user) {
          toggleFollowingState(data.toggleFollowUser.user.following);
        }
      },
      onError: (error) => {
        console.error('Error toggling follow status:', error.message);
      },
    }
  );

  const handleFollowClick = async () => {
    try {
      await toggleFollowing({
        variables: {
          username: authorHandle,
        },
      });
    } catch (error) {}
  };

  return (
    <div className="flex flex-col items-start justify-start my-4 space-y-4 max-h-[90vh] overflow-y-auto">
      <Avatar className="w-16 h-16">
        {authorAvatarSrc ? (
          <AvatarImage
            alt={`@${authorHandle}`}
            src={authorAvatarSrc}
            className="rounded-full"
          />
        ) : (
          <AvatarFallback className="flex items-center justify-center rounded-full bg-gray-300 text-gray-800">
            {authorName ? authorName.substring(0, 2).toUpperCase() : 'UN'}
          </AvatarFallback>
        )}
      </Avatar>
      <div>
        <h3 className="text-xl font-bold">{authorName}</h3>
        <p className="text-gray-500">@{authorHandle}</p>
        {following && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Following
            <UserCheck className="ml-1.5 h-4 w-4" />
          </span>
        )}
      </div>
      {me !== authorHandle && (
        <Button
          disabled={togglingFollowing}
          onClick={handleFollowClick}
          className="flex items-center"
        >
          {following ? (
            <>
              <UserCheck className="mr-2" /> Following
            </>
          ) : (
            <>
              <Plus className="mr-2" /> Follow on Hashnode
            </>
          )}
        </Button>
      )}
      <p className="text-gray-600">{authorBio}</p>
      <Separator />
      {authorProfileLink && (
        <>
          {' '}
          <h4 className="text-lg font-bold">Social Media Links</h4>
          <div className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            <a
              className="hover:underline"
              href={authorProfileLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{authorHandle}
            </a>
          </div>
        </>
      )}
      <Separator />
      <div className="w-full">
        <p className="text-gray-600">
          Member Since: {dayjs(memberSince).format('MMMM D, YYYY')}
        </p>
        {country && <p className="text-gray-600">Country: {country}</p>}
        <p className="text-gray-600">Location: {location}</p>
        <p className="text-gray-600">Followers: {followersCount}</p>
        <p className="text-gray-600">Following: {followingsCount}</p>
      </div>
    </div>
  );
}
