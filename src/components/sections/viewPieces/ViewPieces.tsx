import { Title } from '@/components/ui/Title/Title';
import { CompletedItem } from '@/components/ui/viewPieces/completedItem/CompletedItem';
import './_viewPieces.scss';
import { Products } from '@/types';

interface ViewPiecesProps {
  products: Products;
}

export const ViewPieces = ({ products }: ViewPiecesProps) => {
  return (
    <div className='viewPieces' id='viewPieces'>
      <div className='viewPiecesContainer'>
        <Title title={'Diseños ya hechos'} subTitle={'Piezas únicas, listas para encontrar a su persona.'} />
        <div className='viewPiecesItems'>
          {products.length === 0 ? (
            <p>No hay piezas disponibles en este momento.</p>
          ) : (
            products.map((product) => (
              <CompletedItem key={product.id} item={product} />
            )))
          }
        </div>
      </div>
    </div>
  )
}
