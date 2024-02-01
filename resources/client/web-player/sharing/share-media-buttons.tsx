import {
  ShareableNetworks,
  shareLinkSocially,
} from '@common/utils/urls/share-link-socially';
import {IconButton, IconButtonProps} from '@common/ui/buttons/icon-button';
import {FacebookIcon} from '@common/icons/social/facebook';
import {TwitterIcon} from '@common/icons/social/twitter';
import {TumblrIcon} from '@common/icons/social/tumblr';
import {ShareIcon} from '@common/icons/material/Share';

interface ShareButtonsProps {
  link: string;
  name?: string;
  image?: string;
  size?: IconButtonProps['size'];
}
export function ShareMediaButtons({
  link,
  name,
  image,
  size = 'lg',
}: ShareButtonsProps) {
  const share = (network: ShareableNetworks) => {
    shareLinkSocially(network, link, name, image);
  };

  return (
    <div>
      <IconButton
        size={size}
        onClick={() => share('facebook')}
        className="text-facebook"
      >
        <FacebookIcon />
      </IconButton>
      <IconButton
        size={size}
        onClick={() => share('twitter')}
        className="text-twitter"
      >
        <TwitterIcon />
      </IconButton>
      <IconButton
        size={size}
        onClick={() => share('tumblr')}
        className="text-tumblr"
      >
        <TumblrIcon viewBox="0 0 512 512" />
      </IconButton>
      {navigator.share && (
        <IconButton
          size={size}
          onClick={() => {
            navigator.share({
              title: name,
              url: link,
            });
          }}
          className="text-muted"
        >
          <ShareIcon />
        </IconButton>
      )}
    </div>
  );
}
