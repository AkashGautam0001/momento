import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";

const AllUser = () => {
	const {
		data: creators,
		isLoading: isUserLoading,
		isError: isErrorCreators,
	} = useGetUsers();

	if (isErrorCreators) {
		return <h1>Something went wrong, Please refresh the page</h1>;
	}

	console.log("useGetUsers", creators?.documents);
	return (
		<div className="w-full overflow-scroll custom-scrollbar">
			<div className="user-container">
				{isUserLoading ? (
					<>
						<Loader />
						fetching all user. Please wait
					</>
				) : (
					creators?.documents.map((creator, index) => (
						<li
							key={index}
							className=""
						>
							<div className="">
								<div className="flex gap-4">
									<img
										className="rounded-full w-10"
										src={creator.imageUrl}
										alt="image"
									/>
									<div>
										<h1>{creator.name}</h1>
										<h2 className="text-xs">
											@{creator.username}
										</h2>
									</div>
								</div>

								<Button className="bg-yellow-500">
									Follow
								</Button>
							</div>
						</li>
					))
				)}
			</div>
		</div>
	);
};

export default AllUser;
