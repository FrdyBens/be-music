import {ArtistLinks} from '@app/web-player/artists/artist-links';
import {Trans} from '@common/i18n/trans';
import {Track} from '@app/web-player/tracks/track';
import {
  ContextDialogLayout,
  ContextMenuButton,
  ContextMenuLayoutProps,
} from '@app/web-player/context-dialog/context-dialog-layout';
import {PlaylistPanelButton} from '@app/web-player/context-dialog/playlist-panel';
import {CopyLinkMenuButton} from '@app/web-player/context-dialog/copy-link-menu-button';
import {getTrackLink, TrackLink} from '@app/web-player/tracks/track-link';
import {TrackImage} from '@app/web-player/tracks/track-image/track-image';
import {useTrackPermissions} from '@app/web-player/tracks/hooks/use-track-permissions';
import {AddToQueueButton} from '@app/web-player/context-dialog/add-to-queue-menu-button';
import React, {Fragment, ReactNode, useCallback} from 'react';
import {ToggleInLibraryMenuButton} from '@app/web-player/context-dialog/toggle-in-library-menu-button';
import {ToggleRepostMenuButton} from '@app/web-player/context-dialog/toggle-repost-menu-button';
import {getRadioLink} from '@app/web-player/radio/get-radio-link';
import {useShouldShowRadioButton} from '@app/web-player/tracks/context-dialog/use-should-show-radio-button';
import {useDialogContext} from '@common/ui/overlays/dialog/dialog-context';
import {openGlobalDialog} from '@app/web-player/state/global-dialog-store';
import {ConfirmationDialog} from '@common/ui/overlays/dialog/confirmation-dialog';
import {useDeleteTracks} from '@app/web-player/tracks/requests/use-delete-tracks';
import {useIsMobileMediaQuery} from '@common/utils/hooks/is-mobile-media-query';
import {getArtistLink} from '@app/web-player/artists/artist-link';
import {getAlbumLink} from '@app/web-player/albums/album-link';
import {ShareMediaButton} from '@app/web-player/context-dialog/share-media-button';

export interface TrackContextDialogProps {
  tracks: Track[];
  children?: (tracks: Track[]) => ReactNode;
  showAddToQueueButton?: boolean;
}
export function TrackContextDialog({
  children,
  tracks,
  showAddToQueueButton = true,
}: TrackContextDialogProps) {
  const isMobile = useIsMobileMediaQuery();
  const firstTrack = tracks[0];
  const {canEdit, canDelete} = useTrackPermissions(tracks);
  const shouldShowRadio = useShouldShowRadioButton();

  const loadTracks = useCallback(() => {
    return Promise.resolve(tracks);
  }, [tracks]);

  const headerProps: Partial<ContextMenuLayoutProps> =
    tracks.length === 1
      ? {
          image: <TrackImage track={firstTrack} />,
          title: <TrackLink track={firstTrack} />,
          description: <ArtistLinks artists={firstTrack.artists} />,
        }
      : {};

  return (
    <ContextDialogLayout {...headerProps} loadTracks={loadTracks}>
      {showAddToQueueButton && (
        <AddToQueueButton item={tracks} loadTracks={loadTracks} />
      )}
      <ToggleInLibraryMenuButton items={tracks} />
      {children?.(tracks)}
      <PlaylistPanelButton />
      {tracks.length === 1 ? (
        <Fragment>
          {shouldShowRadio && (
            <ContextMenuButton type="link" to={getRadioLink(firstTrack)}>
              <Trans message="Go to song radio" />
            </ContextMenuButton>
          )}
          {isMobile && (
            <Fragment>
              {firstTrack.artists?.[0] && (
                <ContextMenuButton
                  type="link"
                  to={getArtistLink(firstTrack.artists[0])}
                >
                  <Trans message="Go to artist" />
                </ContextMenuButton>
              )}
              {firstTrack.album && (
                <ContextMenuButton
                  type="link"
                  to={getAlbumLink(firstTrack.album)}
                >
                  <Trans message="Go to album" />
                </ContextMenuButton>
              )}
              <ContextMenuButton type="link" to={getTrackLink(firstTrack)}>
                <Trans message="Go to track" />
              </ContextMenuButton>
            </Fragment>
          )}
          {!isMobile && (
            <CopyLinkMenuButton
              link={getTrackLink(firstTrack, {absolute: true})}
            >
              <Trans message="Copy song link" />
            </CopyLinkMenuButton>
          )}
          {tracks.length === 1 && <ShareMediaButton item={firstTrack} />}
          {tracks.length === 1 ? (
            <ToggleRepostMenuButton item={tracks[0]} />
          ) : null}
          {tracks.length === 1 && canEdit && (
            <ContextMenuButton
              type="link"
              to={`/backstage/tracks/${firstTrack.id}/insights`}
            >
              <Trans message="Insights" />
            </ContextMenuButton>
          )}
          {tracks.length === 1 && canEdit && (
            <ContextMenuButton
              type="link"
              to={`/backstage/tracks/${firstTrack.id}/edit`}
            >
              <Trans message="Edit" />
            </ContextMenuButton>
          )}
        </Fragment>
      ) : null}
      {canDelete && <DeleteButton tracks={tracks} />}
    </ContextDialogLayout>
  );
}

function DeleteButton({tracks}: TrackContextDialogProps) {
  const {close: closeMenu} = useDialogContext();
  const deleteTracks = useDeleteTracks();
  const {canDelete} = useTrackPermissions(tracks);

  if (!canDelete) {
    return null;
  }

  return (
    <ContextMenuButton
      disabled={deleteTracks.isLoading}
      onClick={() => {
        closeMenu();
        openGlobalDialog(ConfirmationDialog, {
          isDanger: true,
          title: <Trans message="Delete tracks" />,
          body: (
            <Trans message="Are you sure you want to delete selected tracks?" />
          ),
          confirm: <Trans message="Delete" />,
          onConfirm: () => {
            deleteTracks.mutate({trackIds: tracks.map(t => t.id)});
          },
        });
      }}
    >
      <Trans message="Delete" />
    </ContextMenuButton>
  );
}
