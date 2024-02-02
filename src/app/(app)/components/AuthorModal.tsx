import { Button } from '@/components/ui/button';
import { AvatarImage, AvatarFallback, Avatar } from '@/components/ui/avatar';
import { Plus, Twitter, UserCheck } from 'lucide-react';
import dayjs from 'dayjs'; // Import dayjs for date formatting
import { Separator } from '@/components/ui/separator';

interface AuthorModalProps {
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
}

export default function AuthorModal({
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
}: AuthorModalProps) {
  return (
    <div className="flex flex-col items-start justify-start my-4 space-y-4">
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
      <Button>
        <Plus className="mr-2" /> Follow on Hashnode
      </Button>
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
