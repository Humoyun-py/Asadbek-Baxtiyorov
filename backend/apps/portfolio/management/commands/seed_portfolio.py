"""Idempotent initial data from the original portfolio presentation.

Existing rows are NEVER overwritten (get_or_create) so content edited by the administrator is preserved.
Empty image fields are filled from backend/seed_data/images. Nothing is invented: no project URLs,
no per-campaign ad metrics, no testimonials.
"""
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.campaigns.models import Campaign, CampaignImage, CampaignStatistic
from apps.portfolio.models import PortfolioProfile
from apps.projects.models import Project, ProjectCategory, ProjectImage
from apps.services.models import Service
from apps.statistics.models import Statistic
from apps.website_settings.models import WebsiteSettings

IMG = Path(settings.BASE_DIR) / 'seed_data' / 'images'

CATEGORIES = [
    ("Ta'lim", 'education'), ('Shaxsiy brend', 'personal-brand'), ('Savdo', 'e-commerce'), ('AI', 'ai'),
    ('Zargarlik', 'jewelry'), ('Xavfsizlik', 'security'), ('Universitetlar', 'university-campaigns'),
]

PROJECTS = [
    dict(slug='insta-school', title='Insta School', cat='education', badge="Ta'lim",
         short="SMM kursi bo'yicha ta'lim loyihasi — 1500+ o'quvchi.",
         role="Bosh kurator va targetolog — SMM kursi bo'yicha.", client='Nilufar Bahtiyarovna',
         followers=52600, image='insta-school.png', gallery=['insta-school-brand.png'],
         highlights=["Sahifada 52,6 ming obunachi.", "1500+ o'quvchi bilan ta'lim loyihasi."]),
    dict(slug='nargiss-rahmatova', title='Nargiss Rahmatova', cat='personal-brand', badge='Shaxsiy brend',
         short="Lifestyle shaxsiy brend: modest-style, go'zallik va sayohat.",
         role='SMM va targetolog — lifestyle shaxsiy brend.', followers=25300, image='nargiss.png',
         highlights=['25,3 ming obunachi.', 'Asoschisi: @jn.jewelry.uz.'],
         lists=[{'title': "Yo'nalish", 'items': ['Modest-style', "Go'zallik", 'Sayohat']}]),
    dict(slug='tottiy-uz', title='tottiy.uz', cat='e-commerce', badge='Bolalar tovarlari',
         short="Bolalar mahsulotlari loyihasi — O'zbekiston bo'ylab yetkazib berish.",
         role='Bolalar mahsulotlari loyihasi.', followers=11200, image='tottiy.png',
         highlights=['11,2 ming obunachi.', "O'zbekiston bo'ylab yetkazib berish."],
         lists=[{'title': 'Mahsulotlar', 'items': ['Bolalar ovqatlari', 'Pampers', 'Kasha', "O'yinchoqlar"]}]),
    dict(slug='maqsad-master', title='Maqsad Master', cat='ai', badge='AI mini ilova',
         short='Telegram ichida ishlaydigan AI mini ilova — maqsad, vazifa, mashq va ovqatlanish.',
         role='Telegram ichidagi AI mini ilova loyihasi.', handle='@Maqsad_master_bot', image='maqsad-master.png',
         highlights=["Kattalar va kichiklar uchun mo'ljallangan.", 'Telegram ichida ishlaydi.'],
         lists=[{'title': 'AI yordamida boshqaradi', 'items': [
             'Maqsadlarni boshqarish', 'Vazifalarni boshqarish', 'Mashqlarni boshqarish',
             'Ovqatlanishni boshqarish']}]),
    dict(slug='abduniyoz-aliyorov', title='Abduniyoz Aliyorov', cat='personal-brand', badge='Shaxsiy brend',
         short='Kontent-maker va marketing mutaxassisi brendi — 13 ming obunachi.',
         role='Shaxsiy brend va targeting.', followers=13000, image='abduniyoz.png',
         highlights=['Kontent-maker va marketing mutaxassisi brendi.', '13 ming obunachi.',
                     "Shaxsiy brend qurish bo'yicha mutaxassis."]),
    dict(slug='jn-jewelry', title='JN Jewelry', cat='e-commerce', badge='Zargarlik',
         short='Ayollar uchun luxury zargarlik — lid generatsiya orqali sotuv.',
         role='Lid generatsiya orqali sotuv.', direction='Ayollar uchun zargarlik loyihasi.', image='jn-jewelry.png',
         highlights=["Buyurtmalar to'g'ridan-to'g'ri Instagram Direct orqali tushadi."],
         lists=[{'title': 'Uslub', 'items': ['Luxury', 'Premium', 'Minimal', 'Nafis', 'Klassik']}]),
    dict(slug='kamerachi', title='Kamerachi', cat='e-commerce', badge='Xavfsizlik tizimlari',
         short='Premium xavfsizlik tizimlari — aloqa Direct orqali.', role='Xavfsizlik tizimlari loyihasi.',
         followers=656, image='kamerachi.png',
         highlights=['Premium xavfsizlik tizimlari.', '656 obunachi.', 'Aloqa Direct orqali.']),
]

UNIVERSITIES = [
    dict(slug='tpu', short='TPU', name='Tashkent Perfect University', image='perfect.png', followers=104000,
         stats=[('30', "TOP yo'nalish", '')],
         points=['104 ming obunachi.', "30 ta TOP yo'nalish.", 'Meta Ads orqali qabul uchun arizalar.']),
    dict(slug='sarbon', short='SARBON', name='Sarbon University', image='sarbon.png', followers=None,
         stats=[('2', 'filial: Namangan, Samarqand', '')],
         points=["Rasmiy qabul bo'limi sahifasi.", 'Namangan va Samarqand filiallari uchun kampaniyalar.',
                 'Meta Ads orqali qabul uchun arizalar.']),
    dict(slug='tgfu', short='TGFU', name='Toshkent Gumanitar Fanlar Universiteti', image='tgfu.png',
         followers=19700, stats=[],
         points=['19,7 ming obunachi.', "Toshkent, Samarqand va To'rtko'l.", 'Namangan va Samarqand kampaniyalari.']),
    dict(slug='arbu', short='ARBU SAMARQAND', name='Abu Rayhon Beruniy Universiteti', image='arbu.png',
         followers=20400, stats=[('30', "yo'nalish", '+')],
         points=['20,4 ming obunachi.', "Yurisprudensiya va 30+ yo'nalish.", 'Qarshi filiali uchun alohida kampaniya.']),
]
UNI_ROLE = 'Targetolog — qabul uchun lid generatsiya.'

SERVICES = [
    ('Targeting', 'Meta Ads orqali kerakli auditoriyaga reklama.', 'Target'),
    ('SMM', 'Sahifa, kontent va brend yuritish.', 'Megaphone'),
    ('Lid generatsiya', "Reklamadan to'g'ridan-to'g'ri mijoz so'rovlarini olish.", 'Users'),
    ('AI yechimlar', 'AI ulangan Telegram mini ilovalar.', 'Bot'),
]

# key, title, value, prefix, suffix, description, category
STATS = [
    ('experience', 'Tajriba', 2, '', ' yil', 'Yillik tajriba', 'GENERAL'),
    ('projects-count', 'Loyihalar', 10, '', '+', 'Bajarilgan loyihalar', 'GENERAL'),
    ('advertising-budget', 'Umumiy reklama byudjeti', 180000, '$', '+',
     'Barcha loyihalar bo\'yicha umumiy byudjet (universitet kampaniyalaridan alohida)', 'GENERAL'),
    ('uni-ad-spend', 'Sarflangan reklama byudjeti', 29049, '$', '', 'Umumiy xarajat (12 ta universitet kampaniyasi)', 'UNIVERSITY'),
    ('uni-impressions', "Ko'rsatuvlar", 26618412, '', '', "26 618 412 ta", 'UNIVERSITY'),
    ('uni-clicks', 'Kliklar', 183319, '', '', "Havola bo'yicha", 'UNIVERSITY'),
    ('uni-leads', 'Lidlar / arizalar', 30852, '', '', 'Qabul arizalari', 'UNIVERSITY'),
    ('uni-cost-per-lead', '1 ta lid narxi', Decimal('0.94'), '$', '', '', 'UNIVERSITY'),
    ('uni-cpc', '1 ta klik narxi', Decimal('0.16'), '$', '', '', 'UNIVERSITY'),
    ('uni-cpm', "1000 ta ko'rsatuv narxi (CPM)", Decimal('1.09'), '$', '', '', 'UNIVERSITY'),
]


def attach(obj, field, filename):
    """Fill an empty image field from seed_data (never replaces an existing image)."""
    f = getattr(obj, field)
    path = IMG / filename
    if f or not path.exists():
        return
    with path.open('rb') as fh:
        f.save(filename, File(fh), save=True)


class Command(BaseCommand):
    help = 'Create the initial portfolio content (safe to run repeatedly).'

    @transaction.atomic
    def handle(self, *args, **opts):
        profile, created = PortfolioProfile.objects.get_or_create(pk=1, defaults=dict(
            full_name='Asadbek Baxtiyorov',
            professional_title='Targetolog • SMM Specialist • AI Specialist • Canva Designer',
            description="Bizneslar uchun samarali reklama strategiyalari, mijoz jalb qilish tizimlari va "
                        "zamonaviy raqamli yechimlar yarataman.",
            biography="Men bizneslar, shaxsiy brendlar va ta'lim loyihalarini rivojlantirish uchun target reklama, "
                      "SMM va lid generatsiya yo'nalishlarida ishlayman. Asosiy maqsadim — reklama orqali kerakli "
                      "auditoriyani topish, mijozlar oqimini shakllantirish va biznes natijalarini yaxshilash.",
            experience_years=2, projects_count='10+', advertising_budget='$180 000+',
            agency_name='Global Targeting Agency', telegram_url='https://t.me/baxt1yorov_asadbek'))
        attach(profile, 'profile_image', 'portrait.png')

        WebsiteSettings.objects.get_or_create(pk=1, defaults=dict(
            website_title='Asadbek Baxtiyorov | Targetolog & SMM Specialist',
            website_description='Asadbek Baxtiyorov — Targetolog, SMM mutaxassisi va AI Specialist.',
            seo_title='Asadbek Baxtiyorov | Targetolog & SMM Specialist',
            seo_description='Real loyihalar, Meta Ads natijalari va professional marketing xizmatlari.',
            telegram_url='https://t.me/baxt1yorov_asadbek', footer_text='Asadbek Baxtiyorov'))

        cats = {}
        for i, (name, slug) in enumerate(CATEGORIES):
            cats[slug], _ = ProjectCategory.objects.get_or_create(slug=slug, defaults={'name': name, 'display_order': i})

        order = 0
        for p in PROJECTS:
            proj, _ = Project.objects.get_or_create(slug=p['slug'], defaults=dict(
                title=p['title'], category=cats[p['cat']], badge=p['badge'], short_description=p['short'],
                role=p.get('role', ''), client_name=p.get('client', ''), followers_count=p.get('followers'),
                handle=p.get('handle', ''), direction=p.get('direction', ''), highlights=p.get('highlights', []),
                extra_lists=p.get('lists', []), display_order=order, is_published=True))
            order += 1
            attach(proj, 'project_image', p['image'])
            if not proj.gallery.exists():
                for j, g in enumerate(p.get('gallery', [])):
                    gi = ProjectImage(project=proj, display_order=j)
                    attach(gi, 'image', g)
        for u in UNIVERSITIES:
            proj, _ = Project.objects.get_or_create(slug=f"uni-{u['slug']}", defaults=dict(
                title=u['name'], category=cats['university-campaigns'], badge="Ta'lim / Qabul",
                short_description=u['points'][-1], role=UNI_ROLE, followers_count=u['followers'],
                highlights=u['points'], display_order=order, is_published=True))
            order += 1
            attach(proj, 'project_image', u['image'])

        for i, (title, desc, icon) in enumerate(SERVICES):
            Service.objects.get_or_create(title=title, defaults={'description': desc, 'icon': icon, 'display_order': i})

        for i, (key, title, value, prefix, suffix, desc, cat) in enumerate(STATS):
            Statistic.objects.get_or_create(key=key, defaults=dict(
                title=title, value=Decimal(value), prefix=prefix, suffix=suffix, description=desc,
                category=cat, display_order=i))

        for i, u in enumerate(UNIVERSITIES):
            camp, _ = Campaign.objects.get_or_create(title=u['short'], defaults=dict(
                university_name=u['name'], role=UNI_ROLE, points=u['points'], followers_count=u['followers'],
                display_order=i, is_active=True))
            attach(camp, 'campaign_image', u['image'])
            if not camp.statistics.exists():
                for j, (value, label, suffix) in enumerate(u['stats']):
                    CampaignStatistic.objects.create(campaign=camp, title=label, value=Decimal(value),
                                                     suffix=suffix, display_order=j)
        self.stdout.write(self.style.SUCCESS('Portfolio seed data is in place.'))
