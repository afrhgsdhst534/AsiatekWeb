// client/src/data/brands.ts

// Interface for brand data
export interface Brand {
  slug: string;
  name: string;
  fullName?: string;
  description: string;
  models?: string[];
  logoSrc?: string;
  category: 'chinese' | 'commercial' | 'passenger';
}

// Chinese brands
export const chineseBrands: Brand[] = [
  {
    slug: 'sitrak',
    name: 'sitrak',
    fullName: 'Sitrak (Ситрак)',
    description: 'Sitrak - это бренд коммерческих грузовиков, созданный совместным предприятием между немецким MAN и китайским Sinotruk. Мы предлагаем широкий ассортимент оригинальных и аналоговых запчастей для грузовиков Sitrak всех моделей.',
    models: ['C7H', 'T7H', 'A7H'],
    logoSrc: '/assets/logos/row2/ChatGPT Image Apr 14, 2025, 09_41_05 PM.png',
    category: 'chinese'
  },
  {
    slug: 'howo',
    name: 'howo',
    fullName: 'HOWO (Хово)',
    description: 'HOWO - известный китайский бренд грузовых автомобилей, принадлежащий корпорации Sinotruk. Мы поставляем качественные оригинальные и аналоговые запчасти для всех моделей грузовиков HOWO.',
    models: ['A7', 'T5G', 'T7H'],
    logoSrc: '/assets/logos/row2/ChatGPT Image Apr 14, 2025, 09_42_46 PM.png',
    category: 'chinese'
  },
  {
    slug: 'shacman',
    name: 'shacman',
    fullName: 'Shacman (Шакман)',
    description: 'Shacman - один из ведущих китайских производителей грузовых автомобилей. Наша компания предлагает полный ассортимент запчастей для грузовиков Shacman всех моделей и годов выпуска.',
    models: ['X3000', 'F2000', 'F3000', 'H3000'],
    category: 'chinese'
  },
  {
    slug: 'sinotruk',
    name: 'sinotruk',
    fullName: 'Sinotruk (Синотрак)',
    description: 'Sinotruk - крупный китайский производитель грузовых автомобилей. Мы предлагаем широкий выбор запчастей для всех моделей грузовиков Sinotruk, включая оригинальные детали и качественные аналоги.',
    models: ['HOWO', 'HOHAN', 'SITRAK'],
    category: 'chinese'
  },
  {
    slug: 'faw',
    name: 'faw',
    fullName: 'FAW (ФАВ)',
    description: 'FAW - одна из старейших и крупнейших автомобилестроительных компаний Китая. В нашем каталоге представлены оригинальные и аналоговые запчасти для всех моделей грузовиков FAW.',
    models: ['J6', 'Tiger V', 'Jiefang'],
    category: 'chinese'
  },
  {
    slug: 'dongfeng',
    name: 'dongfeng',
    fullName: 'Dongfeng (Донгфенг)',
    description: 'Dongfeng - один из ведущих производителей коммерческого транспорта в Китае. Мы предлагаем полный спектр запчастей для грузовиков Dongfeng всех модификаций.',
    models: ['KL', 'KR', 'DFL'],
    category: 'chinese'
  }
];

// Commercial brands
export const commercialBrands: Brand[] = [
  {
    slug: 'mercedes',
    name: 'mercedes',
    fullName: 'Mercedes-Benz Trucks',
    description: 'Mercedes-Benz Trucks - подразделение Daimler AG, производящее грузовые автомобили премиум-класса. Мы поставляем оригинальные и аналоговые запчасти для грузовиков Mercedes-Benz всех моделей.',
    models: ['Actros', 'Arocs', 'Atego', 'Axor'],
    category: 'commercial'
  },
  {
    slug: 'volvo',
    name: 'volvo',
    fullName: 'Volvo Trucks',
    description: 'Volvo Trucks - шведский производитель грузовых автомобилей, известный своей безопасностью и надежностью. В нашем ассортименте представлены запчасти для всех серий грузовиков Volvo.',
    models: ['FH', 'FM', 'FMX', 'FE', 'FL'],
    category: 'commercial'
  },
  {
    slug: 'scania',
    name: 'scania',
    fullName: 'Scania',
    description: 'Scania - шведский производитель тяжелых грузовых автомобилей и автобусов. Мы предлагаем широкий выбор запчастей для грузовиков Scania всех серий и поколений.',
    models: ['R-series', 'S-series', 'G-series', 'P-series'],
    category: 'commercial'
  },
  {
    slug: 'man',
    name: 'man',
    fullName: 'MAN Truck & Bus',
    description: 'MAN - немецкий производитель коммерческих автомобилей, входящий в группу Volkswagen AG. Наша компания поставляет запчасти для всех моделей грузовиков MAN.',
    models: ['TGX', 'TGS', 'TGM', 'TGL'],
    category: 'commercial'
  }
];

// Passenger car brands
export const passengerBrands: Brand[] = [
  {
    slug: 'bmw',
    name: 'bmw',
    fullName: 'BMW',
    description: 'BMW - немецкий производитель премиальных автомобилей и мотоциклов. Мы предлагаем оригинальные и аналоговые запчасти для всех моделей BMW.',
    models: ['3 Series', '5 Series', '7 Series', 'X5', 'X7'],
    category: 'passenger'
  },
  {
    slug: 'toyota',
    name: 'toyota',
    fullName: 'Toyota',
    description: 'Toyota - японский автопроизводитель, известный своей надежностью и долговечностью. В нашем каталоге представлены запчасти для всех популярных моделей Toyota.',
    models: ['Camry', 'Corolla', 'Land Cruiser', 'RAV4', 'Prado'],
    category: 'passenger'
  },
  {
    slug: 'kia',
    name: 'kia',
    fullName: 'Kia',
    description: 'Kia - южнокорейский производитель автомобилей с широкой линейкой моделей. Мы поставляем запчасти для всех современных моделей Kia.',
    models: ['Rio', 'Sportage', 'Sorento', 'Cerato', 'K5'],
    category: 'passenger'
  },
  {
    slug: 'hyundai',
    name: 'hyundai',
    fullName: 'Hyundai',
    description: 'Hyundai - южнокорейский автопроизводитель с обширной линейкой автомобилей. В нашем ассортименте представлены запчасти для всех популярных моделей Hyundai.',
    models: ['Solaris', 'Creta', 'Santa Fe', 'Tucson', 'Elantra'],
    category: 'passenger'
  }
];

// All brands combined
export const allBrands: Brand[] = [
  ...chineseBrands,
  ...commercialBrands,
  ...passengerBrands
];

// Function to get brand by slug
export function getBrandBySlug(slug: string): Brand | undefined {
  return allBrands.find(brand => brand.slug === slug);
}