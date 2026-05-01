import json

with open('src/data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data['templates']:
    pid = item['id']
    if pid == 'prompt-15':
        item['raw_template'] = item['raw_template'].replace('อเมริกาโน่คั่วอ่อน', 'อเมริกาโน่[ระดับการคั่ว]').replace('กัวเตมาลา', '[สายพันธุ์กาแฟ]').replace('“คั่วอ่อน”', '“[ระดับการคั่ว]”').replace('“กัวเตมาลา”', '“[สายพันธุ์กาแฟ]”')
        item['placeholders'] = [
            {'id': 'ระดับการคั่ว', 'options': ['คั่วอ่อน', 'คั่วกลาง', 'คั่วเข้ม']},
            {'id': 'สายพันธุ์กาแฟ', 'options': ['กัวเตมาลา', 'เอธิโอเปีย', 'บราซิล']}
        ]
    elif pid == 'prompt-16':
        item['raw_template'] = item['raw_template'].replace('ท่องเที่ยวประเทศอังกฤษ', 'ท่องเที่ยวประเทศ[ประเทศ]').replace('ทริปอังกฤษ', 'ทริป[ประเทศ]').replace('ธงอังกฤษ', 'ธง[ประเทศ]').replace('ชาอังกฤษ', 'ชา[ประเทศ]').replace('ของฝากอังกฤษ', 'ของฝาก[ประเทศ]').replace('Cute Chibi Isometric 3D', '[สไตล์ภาพ]').replace('ENGLAND TRIP', '[หัวข้อใหญ่]')
        item['placeholders'] = [
            {'id': 'ประเทศ', 'options': ['อังกฤษ', 'ญี่ปุ่น', 'เกาหลี']},
            {'id': 'สไตล์ภาพ', 'options': ['Cute Chibi Isometric 3D', 'Minimal Flat Design', 'Watercolor Style']},
            {'id': 'หัวข้อใหญ่', 'options': ['ENGLAND TRIP', 'JAPAN TRIP', 'KOREA TRIP']}
        ]
    elif pid == 'prompt-17':
        item['raw_template'] = item['raw_template'].replace('ตั้งแต่อายุ 2 ปี ถึง 20 ปี', 'ตั้งแต่อายุ [อายุเริ่มต้น] ปี ถึง [อายุสิ้นสุด] ปี')
        item['placeholders'] = [
            {'id': 'อายุเริ่มต้น', 'options': ['2', '5', '10']},
            {'id': 'อายุสิ้นสุด', 'options': ['20', '30', '50']}
        ]
    elif pid == 'prompt-18':
        item['raw_template'] = item['raw_template'].replace('12 แบบ', '[จำนวน] แบบ').replace('พื้นหลังสีขาว', 'พื้นหลัง[สีพื้นหลัง]')
        item['placeholders'] = [
            {'id': 'สีพื้นหลัง', 'options': ['สีขาว', 'โปร่งใส', 'สีพาสเทล']},
            {'id': 'จำนวน', 'options': ['12', '6', '9']}
        ]
    elif pid == 'prompt-19':
        item['raw_template'] = item['raw_template'].replace('แบบ minimal', 'แบบ [สไตล์]')
        item['placeholders'] = [
            {'id': 'สไตล์', 'options': ['minimal', 'modern', 'luxury']}
        ]
    elif pid == 'prompt-20':
        item['raw_template'] = item['raw_template'].replace('10 แบบ', '[จำนวน] แบบ').replace('โทนสีขาว minimal', 'โทนสี[โทนสี]')
        item['placeholders'] = [
            {'id': 'โทนสี', 'options': ['ขาว minimal', 'ดำเท่ๆ', 'พาสเทล']},
            {'id': 'จำนวน', 'options': ['10', '6', '12']}
        ]
    elif pid == 'prompt-21':
        item['raw_template'] = item['raw_template'].replace('โหงวเฮ้งจีน', '[ศาสตร์วิเคราะห์]')
        item['placeholders'] = [
            {'id': 'ศาสตร์วิเคราะห์', 'options': ['โหงวเฮ้งจีน', 'นรลักษณ์ศาสตร์', 'โหงวเฮ้งเกาหลี']}
        ]
    elif pid == 'prompt-22':
        item['raw_template'] = item['raw_template'].replace('AirPods Max 2', '[ชื่อสินค้า]')
        item['placeholders'] = [
            {'id': 'ชื่อสินค้า', 'options': ['AirPods Max 2', 'iPhone 16 Pro', 'iPad Pro M4']}
        ]
    elif pid == 'prompt-23':
        item['raw_template'] = item['raw_template'].replace('Beats Solo 4 JENNIE Special Edition', '[ชื่อสินค้าพิเศษ]')
        item['placeholders'] = [
            {'id': 'ชื่อสินค้าพิเศษ', 'options': ['Beats Solo 4 JENNIE Special Edition', 'AirPods Pro 2 Dragon Edition', 'Sony WH-1000XM5']}
        ]

with open('src/data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
