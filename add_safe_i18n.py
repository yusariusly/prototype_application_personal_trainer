import json
import os

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'Start Your Journey': '<span data-i18n="hero_start">Start Your Journey</span>',
    'Cancel Anytime': '<span data-i18n="hero_cancel">Cancel Anytime</span>',
    'Personal Dashboard': '<span data-i18n="hero_dashboard">Personal Dashboard</span>',
    '<h3 class="font-headline font-bold text-lg">Weekly Progress</h3>': '<h3 class="font-headline font-bold text-lg" data-i18n="progress_title">Weekly Progress</h3>',
    '<p class="text-xs text-slate-500">Muscle Mass vs Body Fat</p>': '<p class="text-xs text-slate-500" data-i18n="progress_desc">Muscle Mass vs Body Fat</p>',
    '<span class="text-[10px] uppercase font-bold text-slate-500">Muscle Gained</span>': '<span class="text-[10px] uppercase font-bold text-slate-500" data-i18n="progress_muscle">Muscle Gained</span>',
    '<span class="text-[10px] uppercase font-bold text-slate-500">Body Fat</span>': '<span class="text-[10px] uppercase font-bold text-slate-500" data-i18n="progress_fat">Body Fat</span>',
    '<p class="text-sm font-bold">Workout Complete!</p>': '<p class="text-sm font-bold" data-i18n="workout_complete">Workout Complete!</p>',
    '<p class="text-xs text-slate-400">Upper Body Power</p>': '<p class="text-xs text-slate-400" data-i18n="workout_desc">Upper Body Power</p>',
    '<p class="text-slate-600 text-lg">A comprehensive suite of tools designed for both trainers and clients to maximize results and accountability.</p>': '<p class="text-slate-600 text-lg" data-i18n="platform_desc">A comprehensive suite of tools designed for both trainers and clients to maximize results and accountability.</p>',
    '<h4 class="text-white font-headline font-bold mb-6 uppercase tracking-wider text-sm">Resources</h4>': '<h4 class="text-white font-headline font-bold mb-6 uppercase tracking-wider text-sm" data-i18n="footer_resources">Resources</h4>',
    'Help Center</a>': 'Help Center</a>'.replace('Help Center', '<span data-i18n="footer_help">Help Center</span>'),
    'Workout Guides</a>': 'Workout Guides</a>'.replace('Workout Guides', '<span data-i18n="footer_guides">Workout Guides</span>'),
    'Nutrition Tips</a>': 'Nutrition Tips</a>'.replace('Nutrition Tips', '<span data-i18n="footer_nutrition">Nutrition Tips</span>'),
    'Community</a>': 'Community</a>'.replace('Community', '<span data-i18n="footer_community">Community</span>'),
    '<h4 class="text-white font-headline font-bold mb-6 uppercase tracking-wider text-sm">Stay Updated</h4>': '<h4 class="text-white font-headline font-bold mb-6 uppercase tracking-wider text-sm" data-i18n="footer_stay_updated">Stay Updated</h4>',
    '<p class="text-slate-400 text-sm mb-4 font-medium">Subscribe to our newsletter for the latest fitness tips and platform updates.</p>': '<p class="text-slate-400 text-sm mb-4 font-medium" data-i18n="footer_newsletter_desc">Subscribe to our newsletter for the latest fitness tips and platform updates.</p>',
    'Privacy Policy</a>': 'Privacy Policy</a>'.replace('Privacy Policy', '<span data-i18n="footer_privacy">Privacy Policy</span>'),
    'Terms of Service</a>': 'Terms of Service</a>'.replace('Terms of Service', '<span data-i18n="footer_terms">Terms of Service</span>')
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done index.html")

def add_locales():
    en = json.load(open('src/locales/en.json', 'r', encoding='utf-8'))
    id_loc = json.load(open('src/locales/id.json', 'r', encoding='utf-8'))
    
    updates_en = {
        "hero_start": "Start Your Journey",
        "hero_cancel": "Cancel Anytime",
        "hero_dashboard": "Personal Dashboard",
        "progress_title": "Weekly Progress",
        "progress_desc": "Muscle Mass vs Body Fat",
        "progress_muscle": "Muscle Gained",
        "progress_fat": "Body Fat",
        "workout_complete": "Workout Complete!",
        "workout_desc": "Upper Body Power",
        "platform_desc": "A comprehensive suite of tools designed for both trainers and clients to maximize results and accountability.",
        "footer_resources": "Resources",
        "footer_help": "Help Center",
        "footer_guides": "Workout Guides",
        "footer_nutrition": "Nutrition Tips",
        "footer_community": "Community",
        "footer_stay_updated": "Stay Updated",
        "footer_newsletter_desc": "Subscribe to our newsletter for the latest fitness tips and platform updates.",
        "footer_privacy": "Privacy Policy",
        "footer_terms": "Terms of Service"
    }
    
    updates_id = {
        "hero_start": "Mulai Perjalanan Anda",
        "hero_cancel": "Batalkan Kapan Saja",
        "hero_dashboard": "Dasbor Pribadi",
        "progress_title": "Progres Mingguan",
        "progress_desc": "Massa Otot vs Lemak Tubuh",
        "progress_muscle": "Otot Bertambah",
        "progress_fat": "Lemak Tubuh",
        "workout_complete": "Latihan Selesai!",
        "workout_desc": "Kekuatan Tubuh Bagian Atas",
        "platform_desc": "Rangkaian alat komprehensif yang dirancang untuk pelatih dan klien guna memaksimalkan hasil.",
        "footer_resources": "Sumber Daya",
        "footer_help": "Pusat Bantuan",
        "footer_guides": "Panduan Latihan",
        "footer_nutrition": "Tips Nutrisi",
        "footer_community": "Komunitas",
        "footer_stay_updated": "Tetap Terkini",
        "footer_newsletter_desc": "Berlangganan buletin kami untuk tips kebugaran terbaru dan pembaruan platform.",
        "footer_privacy": "Kebijakan Privasi",
        "footer_terms": "Ketentuan Layanan"
    }
    
    en.update(updates_en)
    id_loc.update(updates_id)
    
    json.dump(en, open('src/locales/en.json', 'w', encoding='utf-8'), indent=2)
    json.dump(id_loc, open('src/locales/id.json', 'w', encoding='utf-8'), indent=2)
    
add_locales()
