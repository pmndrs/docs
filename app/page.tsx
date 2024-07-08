import { Footer } from '../components/footer';

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between">
			<a
				className="flex justify-center items-center z-[1] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
				href="https://github.com/pmndrs"
			>
				<h1 className="relative z-[1] text-white font-semibold text-6xl">Poimandres</h1>
				<div
					className="pointer-events-none absolute z-0 w-[30rem] h-[30rem]"
					style={{ backgroundImage: 'radial-gradient(rgb(0 0 0 / 89%), transparent 70%)' }}
				/>
			</a>
			<video
				className="object-cover h-screen w-screen z-0 fixed top-0 left-0"
				playsInline
				autoPlay
				muted
				loop
			>
				<source src="/bg.mp4" type="video/mp4" />
			</video>
			<Footer />
		</main>
	);
}
