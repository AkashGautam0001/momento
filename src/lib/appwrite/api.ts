import { ID, ImageGravity, Query } from "appwrite";

import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appwriteCofig, avators, databases, storage } from "./config";

export async function createUserAccount(user: INewUser) {
	try {
		const newAccount = await account.create(
			ID.unique(),
			user.email,
			user.password,
			user.name
		);

		if (!newAccount) throw Error;

		const avatarUrl = avators.getInitials(user.name);

		const newUser = await saveUserToDB({
			accountId: newAccount.$id,
			name: newAccount.name,
			email: newAccount.email,
			username: user.username,
			imageUrl: avatarUrl,
		});
		return newUser;
	} catch (error) {
		console.log(error);
		return error;
	}
}

export async function saveUserToDB(user: {
	accountId: string;
	email: string;
	name: String;
	imageUrl: URL;
	username?: string;
}) {
	try {
		const newUser = await databases.createDocument(
			appwriteCofig.databaseId,
			appwriteCofig.userCollectionId,
			ID.unique(),
			user
		);

		return newUser;
	} catch (error) {
		console.log(error);
	}
}

export async function signInAccount(user: { email: string; password: string }) {
	try {
		const session = await account.createEmailPasswordSession(
			user.email,
			user.password
		);
		return session;
	} catch (error) {
		console.log(error);
	}
}

export async function getAccount() {
	try {
		const currentAccount = await account.get();

		return currentAccount;
	} catch (error) {
		console.log(error);
	}
}

export async function getCurrentUser() {
	try {
		const currentAccount = await account.get();

		if (!currentAccount) throw Error;

		const currentUser = await databases.listDocuments(
			appwriteCofig.databaseId,
			appwriteCofig.userCollectionId,
			[Query.equal("accountId", currentAccount.$id)]
		);

		if (!currentUser) throw Error;

		return currentUser.documents[0];
	} catch (error) {
		console.log(error);
	}
}

export async function signOutAccount() {
	try {
		const session = await account.deleteSession("current");
		localStorage.clear();
		return session;
	} catch (error) {
		console.log(error);
	}
}

//file upload
export async function uploadFile(file: File) {
	try {
		const uploadedFile = await storage.createFile(
			appwriteCofig.storageId,
			ID.unique(),
			file
		);

		return uploadedFile;
	} catch (error) {
		console.log("Error during uploading : ", error);
	}
}

//file preview
export function getFilePreview(fileId: string) {
	try {
		const fileUrl = storage.getFilePreview(
			appwriteCofig.storageId,
			fileId,
			2000,
			2000,
			ImageGravity.Top,
			100
		);
		if (!fileUrl) throw Error;

		return fileUrl;
	} catch (error) {
		console.log("Error during Previewing : ", error);
	}
}

//Post
export async function createPost(post: INewPost) {
	try {
		//upload file to appwrite storage
		const uploadedFile = await uploadFile(post.file[0]);

		if (!uploadedFile) throw Error;

		//get file url
		const fileUrl = getFilePreview(uploadedFile.$id);
		if (!fileUrl) {
			await deleteFile(uploadedFile.$id);
			throw Error;
		}

		//convert tags into array
		const tags = post.tags?.replace(/ /g, "").split(",") || [];

		//create post
		const newPost = await databases.createDocument(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			ID.unique(),
			{
				creator: post.userId,
				caption: post.caption,
				imageUrl: fileUrl,
				imageId: uploadedFile.$id,
				location: post.location,
				tags: tags,
			}
		);

		if (!newPost) {
			await deleteFile(uploadedFile.$id);
			throw Error;
		}

		return newPost;
	} catch (error) {
		console.log("Error during creating new Post : ", error);
	}
}

export async function deleteFile(fileId: string) {
	try {
		await storage.deleteFile(appwriteCofig.storageId, fileId);

		return { status: "ok" };
	} catch (error) {
		console.log(error);
	}
}

export async function getRecentPosts() {
	try {
		const post = await databases.listDocuments(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			[Query.orderDesc("$createdAt"), Query.limit(20)]
		);

		if (!post) throw Error;

		return post;
	} catch (error) {
		console.log("Error :: getRecentPosts ", error);
	}
}

export async function likePost(postId: string, likesArray: string[]) {
	try {
		const updatePost = await databases.updateDocument(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			postId,
			{
				likes: likesArray,
			}
		);

		if (!updatePost) throw Error;

		return updatePost;
	} catch (error) {
		console.log("Error :: likePost ", error);
	}
}

export async function savePost(postId: string, userId: string) {
	try {
		const savedPost = await databases.createDocument(
			appwriteCofig.databaseId,
			appwriteCofig.savesCollectionId,
			ID.unique(),
			{
				user: userId,
				post: postId,
			}
		);

		if (!savedPost) throw Error;

		return savedPost;
	} catch (error) {
		console.log("Error :: savedPost ", error);
	}
}

export async function deleteSavedPost(savedRecordId: string) {
	try {
		const statusCode = await databases.deleteDocument(
			appwriteCofig.databaseId,
			appwriteCofig.savesCollectionId,
			savedRecordId
		);

		if (!statusCode) throw Error;

		return { status: "ok" };
	} catch (error) {
		console.log("Error :: deleteSavedPost ", error);
	}
}

export async function getPostById(postId: string) {
	try {
		const post = await databases.getDocument(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			postId
		);

		return post;
	} catch (error) {
		console.log("Error :: getPostById", error);
	}
}

export async function updatePost(post: IUpdatePost) {
	const hasFileToUpdate = post.file.length > 0;
	try {
		//upload file to appwrite storage
		let image = {
			imageUrl: post.imageUrl,
			imageId: post.imageId,
		};

		if (hasFileToUpdate) {
			const uploadedFile = await uploadFile(post.file[0]);
			if (!uploadedFile) throw Error;

			//get file url
			const fileUrl = getFilePreview(uploadedFile.$id);
			if (!fileUrl) {
				await deleteFile(uploadedFile.$id);
				throw Error;
			}

			image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
		}

		//convert tags into array
		const tags = post.tags?.replace(/ /g, "").split(",") || [];

		//create post
		const updatedPost = await databases.updateDocument(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			post.postId,
			{
				creator: post.creator,
				caption: post.caption,
				imageUrl: image.imageUrl,
				imageId: image.imageId,
				location: post.location,
				tags: tags,
			}
		);

		if (!updatedPost) {
			await deleteFile(post.imageId);
			throw Error;
		}

		return updatedPost;
	} catch (error) {
		console.log("Error during updating Post : ", error);
	}
}

export async function deletePost(postId: string, imageId: string) {
	if (!postId || !imageId) throw Error;

	try {
		await databases.deleteDocument(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			postId
		);

		return { status: "ok" };
	} catch (error) {
		console.log("Error :: deletePost", error);
	}
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
	const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(20)];

	if (pageParam) {
		queries.push(Query.cursorAfter(pageParam.toString()));
	}

	try {
		const posts = await databases.listDocuments(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			queries
		);

		if (!posts) throw Error;

		return posts;
	} catch (error) {
		console.log("Error :: getInfinitePosts", error);
	}
}

// ! this is edited
export async function getPosts() {
	const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(20)];
	try {
		const posts = await databases.listDocuments(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			queries
		);

		if (!posts) throw Error;

		return posts;
	} catch (error) {
		console.log("Error :: getInfinitePosts", error);
	}
}

export async function searchPosts(searchTerm: string) {
	try {
		const posts = await databases.listDocuments(
			appwriteCofig.databaseId,
			appwriteCofig.postCollectionId,
			[Query.search("caption", searchTerm)]
		);

		if (!posts) throw Error;

		return posts;
	} catch (error) {
		console.log("Error :: getInfinitePosts", error);
	}
}

export async function getUsers() {
	try {
		const users = await databases.listDocuments(
			appwriteCofig.databaseId,
			appwriteCofig.userCollectionId,
			[Query.orderDesc("$createdAt")]
		);

		if (!users) throw Error;
		return users;
	} catch (error) {
		console.log(error);
	}
}
