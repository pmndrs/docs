export function Footer() {
	return (
		<footer className="absolute z-[1] bottom-0 left-0 w-screen">
			<div className="grid grid-cols-3 grid-rows-1 items-center jusitfy-center p-[30px]">
				<div className="text-left">
					<a
						className="opacity-50 hover:opacity-100 transition-opacity duration-200 ease-in-out inline-flex"
						aria-label="Credits"
						href="https://twitter.com/pmndrs"
						target="_blank"
						rel="noopener"
					>
						<div>
							<svg
								width="15"
								height="15"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path fill="#fff" d="M0 0h15v15H0z" />
							</svg>
						</div>
					</a>
				</div>
				<div className="text-center flex flex-row gap-3">
					<Link href="https://docs.pmnd.rs/home">Docs</Link>
					<Link href="https://pmnd.rs/github">GitHub</Link>
					<Link href="https://pmnd.rs/twitter">Twitter</Link>
					<Link href="https://pmnd.rs/discord">Community</Link>
				</div>
				<div className="text-right"></div>
			</div>
		</footer>
	);
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<a className="text-s justify-center" href={href} target="_blank" rel="noopener noreferrer">
			{children}
		</a>
	);
}
