import type { Project, University, Filter } from '../types'
import insta from '../assets/projects/insta-school.png'
import nargiss from '../assets/projects/nargiss.png'
import tottiy from '../assets/projects/tottiy.png'
import maqsad from '../assets/projects/maqsad-master.png'
import abduniyoz from '../assets/projects/abduniyoz.png'
import jn from '../assets/projects/jn-jewelry.png'
import kamerachi from '../assets/projects/kamerachi.png'
import perfect from '../assets/projects/perfect.png'
import sarbon from '../assets/projects/sarbon.png'
import tgfu from '../assets/projects/tgfu.png'
import arbu from '../assets/projects/arbu.png'

export const filters: Filter[] = ['Barchasi', 'Ta\'lim', 'Shaxsiy brend', 'Savdo', 'AI']

export const projects: Project[] = [
  {
    id: 'insta-school', name: 'Insta School', category: 'Ta\'lim', badge: 'Ta\'lim',
    short: 'SMM kursi bo\'yicha ta\'lim loyihasi — 1500+ o\'quvchi.',
    role: 'Bosh kurator va targetolog — SMM kursi bo\'yicha.', author: 'Nilufar Bahtiyarovna',
    image: insta,
    highlights: ['Sahifada 52,6 ming obunachi.', '1500+ o\'quvchi bilan ta\'lim loyihasi.'],
    stats: [{ value: '52,6 ming', label: 'obunachi' }, { value: '1500+', label: 'o\'quvchi' }],
  },
  {
    id: 'nargiss', name: 'Nargiss Rahmatova', category: 'Shaxsiy brend', badge: 'Shaxsiy brend',
    short: 'Lifestyle shaxsiy brend: modest-style, go\'zallik va sayohat.',
    role: 'SMM va targetolog — lifestyle shaxsiy brend.', image: nargiss,
    highlights: ['25,3 ming obunachi.', 'Asoschisi: @jn.jewelry.uz.'],
    lists: [{ title: 'Yo\'nalish', items: ['Modest-style', 'Go\'zallik', 'Sayohat'] }],
    stats: [{ value: '25,3 ming', label: 'obunachi' }],
  },
  {
    id: 'tottiy', name: 'tottiy.uz', category: 'Savdo', badge: 'Bolalar tovarlari',
    short: 'Bolalar mahsulotlari loyihasi — O\'zbekiston bo\'ylab yetkazib berish.',
    role: 'Bolalar mahsulotlari loyihasi.', image: tottiy,
    highlights: ['11,2 ming obunachi.', 'O\'zbekiston bo\'ylab yetkazib berish.'],
    lists: [{ title: 'Mahsulotlar', items: ['Bolalar ovqatlari', 'Pampers', 'Kasha', 'O\'yinchoqlar'] }],
    stats: [{ value: '11,2 ming', label: 'obunachi' }],
  },
  {
    id: 'maqsad-master', name: 'Maqsad Master', category: 'AI', badge: 'AI mini ilova',
    short: 'Telegram ichida ishlaydigan AI mini ilova — maqsad, vazifa, mashq va ovqatlanish.',
    role: 'Telegram ichidagi AI mini ilova loyihasi.', image: maqsad, handle: '@Maqsad_master_bot',
    highlights: ['Kattalar va kichiklar uchun mo\'ljallangan.', 'Telegram ichida ishlaydi.'],
    lists: [{ title: 'AI yordamida boshqaradi', items: ['Maqsadlarni boshqarish', 'Vazifalarni boshqarish', 'Mashqlarni boshqarish', 'Ovqatlanishni boshqarish'] }],
  },
  {
    id: 'abduniyoz', name: 'Abduniyoz Aliyorov', category: 'Shaxsiy brend', badge: 'Shaxsiy brend',
    short: 'Kontent-maker va marketing mutaxassisi brendi — 13 ming obunachi.',
    role: 'Shaxsiy brend va targeting.', image: abduniyoz,
    highlights: ['Kontent-maker va marketing mutaxassisi brendi.', '13 ming obunachi.', 'Shaxsiy brend qurish bo\'yicha mutaxassis.'],
    stats: [{ value: '13 ming', label: 'obunachi' }],
  },
  {
    id: 'jn-jewelry', name: 'JN Jewelry', category: 'Savdo', badge: 'Zargarlik',
    short: 'Ayollar uchun luxury zargarlik — lid generatsiya orqali sotuv.',
    role: 'Lid generatsiya orqali sotuv.', direction: 'Ayollar uchun zargarlik loyihasi.', image: jn,
    highlights: ['Buyurtmalar to\'g\'ridan-to\'g\'ri Instagram Direct orqali tushadi.'],
    lists: [{ title: 'Uslub', items: ['Luxury', 'Premium', 'Minimal', 'Nafis', 'Klassik'] }],
  },
  {
    id: 'kamerachi', name: 'Kamerachi', category: 'Savdo', badge: 'Xavfsizlik tizimlari',
    short: 'Premium xavfsizlik tizimlari — aloqa Direct orqali.',
    role: 'Xavfsizlik tizimlari loyihasi.', image: kamerachi,
    highlights: ['Premium xavfsizlik tizimlari.', '656 obunachi.', 'Aloqa Direct orqali.'],
    stats: [{ value: '656', label: 'obunachi' }],
  },
]

export const universities: University[] = [
  {
    id: 'perfect', short: 'TPU', name: 'Tashkent Perfect University', image: perfect,
    role: 'Targetolog — qabul uchun lid generatsiya.',
    stats: [{ value: '104 ming', label: 'obunachi' }, { value: '30', label: 'TOP yo\'nalish' }],
    points: ['104 ming obunachi.', '30 ta TOP yo\'nalish.', 'Meta Ads orqali qabul uchun arizalar.'],
  },
  {
    id: 'sarbon', short: 'SARBON', name: 'Sarbon University', image: sarbon,
    role: 'Targetolog — qabul uchun lid generatsiya.',
    stats: [{ value: '2', label: 'filial: Namangan, Samarqand' }],
    points: ['Rasmiy qabul bo\'limi sahifasi.', 'Namangan va Samarqand filiallari uchun kampaniyalar.', 'Meta Ads orqali qabul uchun arizalar.'],
  },
  {
    id: 'tgfu', short: 'TGFU', name: 'Toshkent Gumanitar Fanlar Universiteti', image: tgfu,
    role: 'Targetolog — qabul uchun lid generatsiya.',
    stats: [{ value: '19,7 ming', label: 'obunachi' }],
    points: ['19,7 ming obunachi.', 'Toshkent, Samarqand va To\'rtko\'l.', 'Namangan va Samarqand kampaniyalari.'],
  },
  {
    id: 'arbu', short: 'ARBU SAMARQAND', name: 'Abu Rayhon Beruniy Universiteti', image: arbu,
    role: 'Targetolog — qabul uchun lid generatsiya.',
    stats: [{ value: '20,4 ming', label: 'obunachi' }, { value: '30+', label: 'yo\'nalish' }],
    points: ['20,4 ming obunachi.', 'Yurisprudensiya va 30+ yo\'nalish.', 'Qarshi filiali uchun alohida kampaniya.'],
  },
]

// Universitet kampaniyalari ham loyihalar to'plamida (Ta'lim / Qabul) ko'rinadi
const uniProjects: Project[] = universities.map((u) => ({
  id: `uni-${u.id}`,
  name: u.name,
  category: 'Ta\'lim' as const,
  badge: 'Ta\'lim / Qabul',
  short: u.points[u.points.length - 1],
  role: u.role,
  image: u.image,
  highlights: u.points,
  stats: u.stats,
}))

export const allProjects: Project[] = [...projects, ...uniProjects]
