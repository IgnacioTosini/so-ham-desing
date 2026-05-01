import { Title } from '@/components/ui/Title/Title';
import './_aboutBrand.scss';

export const AboutBrand = () => {
  return (
    <div className='aboutBrand'>
      <div className='aboutBrandContent'>
        <Title title={'Sobre la marca'} subTitle={'Joyas que acompañan, no que decoran.'} />
        <div className='aboutBrandTextContainer'>
          <p className='aboutBrandText'>Cada pieza está hecha a mano, con tiempo y con intención. No hay producción en serie: hay encuentros entre vos y la piedra que hoy necesita acompañarte.</p>
          <p className='aboutBrandText'>Trabajamos con cristales naturales, elegidos uno por uno. Su energía es real y su historia es antigua. Lo que hacemos es darles forma para que puedas llevarlos cerca.</p>
          <p className='aboutBrandText accent'>— Desde Mar del Plata, con el mar cerca.</p>
        </div>
      </div>
    </div>
  )
}
