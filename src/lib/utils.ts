import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTimeAgo(timestamp: string | undefined) {
	if (timestamp === undefined) return;
	const currentDate = new Date();
	const previousDate = new Date(timestamp);
	const timeDifference = currentDate.getTime() - previousDate.getTime();

	const minute = 60 * 1000;
	const hour = minute * 60;
	const day = hour * 24;
	const month = day * 30; // Approximating a month to 30 days
	const year = day * 365; // Approximating a year to 365 days

	if (timeDifference < minute) {
		const seconds = Math.floor(timeDifference / 1000);
		return `${seconds} ${seconds === 1 ? "second" : "seconds"} ago`;
	} else if (timeDifference < hour) {
		const minutes = Math.floor(timeDifference / minute);
		return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
	} else if (timeDifference < day) {
		const hours = Math.floor(timeDifference / hour);
		return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
	} else if (timeDifference < month) {
		const days = Math.floor(timeDifference / day);
		return `${days} ${days === 1 ? "day" : "days"} ago`;
	} else if (timeDifference < year) {
		const months = Math.floor(timeDifference / month);
		return `${months} ${months === 1 ? "month" : "months"} ago`;
	} else {
		const years = Math.floor(timeDifference / year);
		return `${years} ${years === 1 ? "year" : "years"} ago`;
	}
}

export function formatDateString(dateString: string) {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "short",
		day: "numeric",
	};

	const date = new Date(dateString);
	const formattedDate = date.toLocaleDateString("en-US", options);

	const time = date.toLocaleTimeString([], {
		hour: "numeric",
		minute: "2-digit",
	});

	return `${formattedDate} at ${time}`;
}

export const checkIsLiked = (likeList: string[], userId: string) => {
	return likeList.includes(userId);
};
