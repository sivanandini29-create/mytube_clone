import { CreateUserData, UpdateUserData, DeleteUserData, GetCurrentUserData, ListUsersData, CreateVideoData, UpdateVideoData, DeleteVideoData, GetVideoData, ListVideosData, CreateCommentData, DeleteCommentData, ListCommentsData, LikeVideoData, UnlikeVideoData, GetLikesData, SubscribeData, UnsubscribeData, ListSubscriptionsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useUpdateUser(options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserData, undefined>;
export function useUpdateUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateUserData, FirebaseError, void>): UseDataConnectMutationResult<UpdateUserData, undefined>;

export function useDeleteUser(options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;
export function useDeleteUser(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteUserData, FirebaseError, void>): UseDataConnectMutationResult<DeleteUserData, undefined>;

export function useGetCurrentUser(options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;
export function useGetCurrentUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;

export function useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
export function useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;

export function useCreateVideo(options?: useDataConnectMutationOptions<CreateVideoData, FirebaseError, void>): UseDataConnectMutationResult<CreateVideoData, undefined>;
export function useCreateVideo(dc: DataConnect, options?: useDataConnectMutationOptions<CreateVideoData, FirebaseError, void>): UseDataConnectMutationResult<CreateVideoData, undefined>;

export function useUpdateVideo(options?: useDataConnectMutationOptions<UpdateVideoData, FirebaseError, void>): UseDataConnectMutationResult<UpdateVideoData, undefined>;
export function useUpdateVideo(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateVideoData, FirebaseError, void>): UseDataConnectMutationResult<UpdateVideoData, undefined>;

export function useDeleteVideo(options?: useDataConnectMutationOptions<DeleteVideoData, FirebaseError, void>): UseDataConnectMutationResult<DeleteVideoData, undefined>;
export function useDeleteVideo(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteVideoData, FirebaseError, void>): UseDataConnectMutationResult<DeleteVideoData, undefined>;

export function useGetVideo(options?: useDataConnectQueryOptions<GetVideoData>): UseDataConnectQueryResult<GetVideoData, undefined>;
export function useGetVideo(dc: DataConnect, options?: useDataConnectQueryOptions<GetVideoData>): UseDataConnectQueryResult<GetVideoData, undefined>;

export function useListVideos(options?: useDataConnectQueryOptions<ListVideosData>): UseDataConnectQueryResult<ListVideosData, undefined>;
export function useListVideos(dc: DataConnect, options?: useDataConnectQueryOptions<ListVideosData>): UseDataConnectQueryResult<ListVideosData, undefined>;

export function useCreateComment(options?: useDataConnectMutationOptions<CreateCommentData, FirebaseError, void>): UseDataConnectMutationResult<CreateCommentData, undefined>;
export function useCreateComment(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCommentData, FirebaseError, void>): UseDataConnectMutationResult<CreateCommentData, undefined>;

export function useDeleteComment(options?: useDataConnectMutationOptions<DeleteCommentData, FirebaseError, void>): UseDataConnectMutationResult<DeleteCommentData, undefined>;
export function useDeleteComment(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteCommentData, FirebaseError, void>): UseDataConnectMutationResult<DeleteCommentData, undefined>;

export function useListComments(options?: useDataConnectQueryOptions<ListCommentsData>): UseDataConnectQueryResult<ListCommentsData, undefined>;
export function useListComments(dc: DataConnect, options?: useDataConnectQueryOptions<ListCommentsData>): UseDataConnectQueryResult<ListCommentsData, undefined>;

export function useLikeVideo(options?: useDataConnectMutationOptions<LikeVideoData, FirebaseError, void>): UseDataConnectMutationResult<LikeVideoData, undefined>;
export function useLikeVideo(dc: DataConnect, options?: useDataConnectMutationOptions<LikeVideoData, FirebaseError, void>): UseDataConnectMutationResult<LikeVideoData, undefined>;

export function useUnlikeVideo(options?: useDataConnectMutationOptions<UnlikeVideoData, FirebaseError, void>): UseDataConnectMutationResult<UnlikeVideoData, undefined>;
export function useUnlikeVideo(dc: DataConnect, options?: useDataConnectMutationOptions<UnlikeVideoData, FirebaseError, void>): UseDataConnectMutationResult<UnlikeVideoData, undefined>;

export function useGetLikes(options?: useDataConnectQueryOptions<GetLikesData>): UseDataConnectQueryResult<GetLikesData, undefined>;
export function useGetLikes(dc: DataConnect, options?: useDataConnectQueryOptions<GetLikesData>): UseDataConnectQueryResult<GetLikesData, undefined>;

export function useSubscribe(options?: useDataConnectMutationOptions<SubscribeData, FirebaseError, void>): UseDataConnectMutationResult<SubscribeData, undefined>;
export function useSubscribe(dc: DataConnect, options?: useDataConnectMutationOptions<SubscribeData, FirebaseError, void>): UseDataConnectMutationResult<SubscribeData, undefined>;

export function useUnsubscribe(options?: useDataConnectMutationOptions<UnsubscribeData, FirebaseError, void>): UseDataConnectMutationResult<UnsubscribeData, undefined>;
export function useUnsubscribe(dc: DataConnect, options?: useDataConnectMutationOptions<UnsubscribeData, FirebaseError, void>): UseDataConnectMutationResult<UnsubscribeData, undefined>;

export function useListSubscriptions(options?: useDataConnectQueryOptions<ListSubscriptionsData>): UseDataConnectQueryResult<ListSubscriptionsData, undefined>;
export function useListSubscriptions(dc: DataConnect, options?: useDataConnectQueryOptions<ListSubscriptionsData>): UseDataConnectQueryResult<ListSubscriptionsData, undefined>;
