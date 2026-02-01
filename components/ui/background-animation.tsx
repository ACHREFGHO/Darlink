export function BackgroundAnimation() {
    return (
        <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-darlink-navy">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-darlink-blue/40 via-darlink-navy to-darlink-navy" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-darlink-blue/30 blur-[100px] animate-blob mix-blend-screen" />
                <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] rounded-full bg-darlink-teal/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
                <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-darlink-blue/20 blur-[100px] animate-blob animation-delay-4000 mix-blend-screen" />
                <div className="absolute bottom-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-darlink-orange/10 blur-[100px] animate-blob animation-delay-4000 mix-blend-screen" />
            </div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
        </div>
    )
}
