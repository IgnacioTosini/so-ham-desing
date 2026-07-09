import './_braceletSizeGuide.scss';

const sizeRows = ['13 cm', '14 cm', '15 cm', '16 cm', '17 cm', '18 cm'];

interface BraceletSizeGuideProps {
    variant?: 'default' | 'compact';
}

export const BraceletSizeGuide = ({ variant = 'default' }: BraceletSizeGuideProps) => {
    const isCompact = variant === 'compact';

    return (
        <section className={`braceletSizeGuide ${isCompact ? 'braceletSizeGuideCompact' : ''}`} aria-label="Guía para elegir la medida de una pulsera">
            <div className="braceletSizeGuideHeader">
                <p>Guía para pulseras</p>
                <h3>Cómo elegir tu medida</h3>
            </div>

            <div className="braceletGuideSteps">
                <article className="braceletGuideStep">
                    <span>1</span>
                    <div>
                        <h4>Medí tu muñeca</h4>
                        <p>Usá una cinta métrica flexible o un hilo/tira de papel y después medilo con una regla.</p>
                        <p>Medí ajustado, pero sin apretar. Ese número es el contorno de tu muñeca.</p>
                    </div>
                </article>

                <article className="braceletGuideStep">
                    <span>2</span>
                    <div>
                        <h4>Elegí el tipo de tanza</h4>
                        <div className="braceletCordTypes">
                            <div>
                                <strong>Tanza elástica</strong>
                                <p>Cómoda, flexible, se adapta a tu muñeca e ideal para uso diario.</p>
                            </div>
                            <div>
                                <strong>Tanza rígida</strong>
                                <p>Se abre y abrocha con cadena extensora. Queda más estructurada y requiere elegir bien la medida.</p>
                            </div>
                        </div>
                    </div>
                </article>
            </div>

            <div className="braceletSizeTableArea">
                <p className="braceletSizeScrollHint">Deslizá la tabla para ver tanza rígida <span aria-hidden="true">→</span></p>
                <div className="braceletSizeTableWrap">
                    <table className="braceletSizeTable">
                        <caption>Holgura recomendada según el contorno de tu muñeca</caption>
                        <thead>
                            <tr>
                                <th scope="col">Muñeca</th>
                                <th scope="col">Tanza elástica</th>
                                <th scope="col">Tanza rígida</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sizeRows.map((size) => (
                                <tr key={size}>
                                    <th scope="row">{size}</th>
                                    <td>+1 a 1,5 cm</td>
                                    <td>+1 a 2 cm</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="braceletSizeNote">
                Si te gusta más suelta, sumá 0,5 cm extra. Si la preferís más ajustada, usá el mínimo indicado.
            </p>
        </section>
    );
};
