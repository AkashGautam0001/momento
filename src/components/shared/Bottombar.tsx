import { bottombarLinks } from "@/constants";
import { Link, useLocation } from "react-router-dom";

const Bottombar = () => {
	const { pathname } = useLocation();
	return (
		<section className="bottom-bar">
			{bottombarLinks.map((link) => {
				const isActive = pathname === link.route;
				return (
					<Link
						to={link.route}
						key={link.label}
						className={`${
							isActive && "bg-yellow-400 rounded-[10px]"
						} flex-center flex-col gap-1 p-2 transition `}
					>
						<img
							src={link.imgURL}
							alt={link.label}
							className={` ${isActive && "invert"}`}
						/>
						<p
							className={`tiny-medium text-light-2 ${
								isActive && "text-black"
							}`}
						>
							{link.label}
						</p>
					</Link>
				);
			})}
		</section>
	);
};

export default Bottombar;
