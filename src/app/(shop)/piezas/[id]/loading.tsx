import "./_pieceDetail.scss";

export default function LoadingPiece() {
    return <main className="pieceDetail" aria-busy="true">
        <section className="pieceDetailHero" role="status" aria-label="Cargando producto">
            <div className="pieceDetailLoadingImage" />
            <div className="pieceDetailIntro"><p>Cargando pieza…</p><div className="pieceDetailLoadingText" /></div>
        </section>
    </main>;
}
