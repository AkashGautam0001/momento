import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteCofig = {
	url: import.meta.env.VITE_APPWRITE_URL,
	projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
	databaseId: import.meta.env.VITE_APPWRITE_DATABASES_ID,
	storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
	postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
	savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
	userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
};

export const client = new Client();
client.setProject(appwriteCofig.projectId);
client.setEndpoint(appwriteCofig.url);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avators = new Avatars(client);
