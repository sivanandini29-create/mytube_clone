import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Comment_Key {
  id: UUIDString;
  __typename?: 'Comment_Key';
}

export interface CreateCommentData {
  comment_insert: Comment_Key;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateVideoData {
  video_insert: Video_Key;
}

export interface DeleteCommentData {
  comment_delete?: Comment_Key | null;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface DeleteVideoData {
  video_delete?: Video_Key | null;
}

export interface GetCurrentUserData {
  user?: {
    id: UUIDString;
    displayName: string;
    email: string;
  } & User_Key;
}

export interface GetLikesData {
  likes: ({
    video: {
      title: string;
    };
  })[];
}

export interface GetVideoData {
  video?: {
    title: string;
    videoUrl: string;
  };
}

export interface LikeVideoData {
  like_insert: Like_Key;
}

export interface Like_Key {
  id: UUIDString;
  __typename?: 'Like_Key';
}

export interface ListCommentsData {
  comments: ({
    content: string;
    author: {
      displayName: string;
    };
  })[];
}

export interface ListSubscriptionsData {
  userSubscriptions: ({
    creator: {
      displayName: string;
    };
  })[];
}

export interface ListUsersData {
  users: ({
    id: UUIDString;
    displayName: string;
  } & User_Key)[];
}

export interface ListVideosData {
  videos: ({
    id: UUIDString;
    title: string;
  } & Video_Key)[];
}

export interface SubscribeData {
  userSubscription_insert: UserSubscription_Key;
}

export interface UnlikeVideoData {
  like_delete?: Like_Key | null;
}

export interface UnsubscribeData {
  userSubscription_delete?: UserSubscription_Key | null;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateVideoData {
  video_update?: Video_Key | null;
}

export interface UserSubscription_Key {
  id: UUIDString;
  __typename?: 'UserSubscription_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Video_Key {
  id: UUIDString;
  __typename?: 'Video_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(): MutationPromise<UpdateUserData, undefined>;
export function updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(): MutationPromise<DeleteUserData, undefined>;
export function deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface CreateVideoRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateVideoData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateVideoData, undefined>;
  operationName: string;
}
export const createVideoRef: CreateVideoRef;

export function createVideo(): MutationPromise<CreateVideoData, undefined>;
export function createVideo(dc: DataConnect): MutationPromise<CreateVideoData, undefined>;

interface UpdateVideoRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateVideoData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateVideoData, undefined>;
  operationName: string;
}
export const updateVideoRef: UpdateVideoRef;

export function updateVideo(): MutationPromise<UpdateVideoData, undefined>;
export function updateVideo(dc: DataConnect): MutationPromise<UpdateVideoData, undefined>;

interface DeleteVideoRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteVideoData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteVideoData, undefined>;
  operationName: string;
}
export const deleteVideoRef: DeleteVideoRef;

export function deleteVideo(): MutationPromise<DeleteVideoData, undefined>;
export function deleteVideo(dc: DataConnect): MutationPromise<DeleteVideoData, undefined>;

interface GetVideoRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetVideoData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetVideoData, undefined>;
  operationName: string;
}
export const getVideoRef: GetVideoRef;

export function getVideo(options?: ExecuteQueryOptions): QueryPromise<GetVideoData, undefined>;
export function getVideo(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetVideoData, undefined>;

interface ListVideosRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListVideosData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListVideosData, undefined>;
  operationName: string;
}
export const listVideosRef: ListVideosRef;

export function listVideos(options?: ExecuteQueryOptions): QueryPromise<ListVideosData, undefined>;
export function listVideos(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListVideosData, undefined>;

interface CreateCommentRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateCommentData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateCommentData, undefined>;
  operationName: string;
}
export const createCommentRef: CreateCommentRef;

export function createComment(): MutationPromise<CreateCommentData, undefined>;
export function createComment(dc: DataConnect): MutationPromise<CreateCommentData, undefined>;

interface DeleteCommentRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteCommentData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteCommentData, undefined>;
  operationName: string;
}
export const deleteCommentRef: DeleteCommentRef;

export function deleteComment(): MutationPromise<DeleteCommentData, undefined>;
export function deleteComment(dc: DataConnect): MutationPromise<DeleteCommentData, undefined>;

interface ListCommentsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCommentsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCommentsData, undefined>;
  operationName: string;
}
export const listCommentsRef: ListCommentsRef;

export function listComments(options?: ExecuteQueryOptions): QueryPromise<ListCommentsData, undefined>;
export function listComments(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListCommentsData, undefined>;

interface LikeVideoRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<LikeVideoData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<LikeVideoData, undefined>;
  operationName: string;
}
export const likeVideoRef: LikeVideoRef;

export function likeVideo(): MutationPromise<LikeVideoData, undefined>;
export function likeVideo(dc: DataConnect): MutationPromise<LikeVideoData, undefined>;

interface UnlikeVideoRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UnlikeVideoData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UnlikeVideoData, undefined>;
  operationName: string;
}
export const unlikeVideoRef: UnlikeVideoRef;

export function unlikeVideo(): MutationPromise<UnlikeVideoData, undefined>;
export function unlikeVideo(dc: DataConnect): MutationPromise<UnlikeVideoData, undefined>;

interface GetLikesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetLikesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetLikesData, undefined>;
  operationName: string;
}
export const getLikesRef: GetLikesRef;

export function getLikes(options?: ExecuteQueryOptions): QueryPromise<GetLikesData, undefined>;
export function getLikes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetLikesData, undefined>;

interface SubscribeRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<SubscribeData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<SubscribeData, undefined>;
  operationName: string;
}
export const subscribeRef: SubscribeRef;

export function subscribe(): MutationPromise<SubscribeData, undefined>;
export function subscribe(dc: DataConnect): MutationPromise<SubscribeData, undefined>;

interface UnsubscribeRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UnsubscribeData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UnsubscribeData, undefined>;
  operationName: string;
}
export const unsubscribeRef: UnsubscribeRef;

export function unsubscribe(): MutationPromise<UnsubscribeData, undefined>;
export function unsubscribe(dc: DataConnect): MutationPromise<UnsubscribeData, undefined>;

interface ListSubscriptionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListSubscriptionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListSubscriptionsData, undefined>;
  operationName: string;
}
export const listSubscriptionsRef: ListSubscriptionsRef;

export function listSubscriptions(options?: ExecuteQueryOptions): QueryPromise<ListSubscriptionsData, undefined>;
export function listSubscriptions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListSubscriptionsData, undefined>;

