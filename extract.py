import os, re

def extract_inline_module(filepath, dest_js_path, src_attr_path):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # find <script type="module">...</script>
    pattern = re.compile(r'<script\s+type=["\']module["\']\s*>(.*?)</script>', re.DOTALL)
    match = pattern.search(content)
    if match:
        js_content = match.group(1).strip()
        
        # ensure dir exists
        os.makedirs(os.path.dirname(dest_js_path), exist_ok=True)
        
        with open(dest_js_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
        
        new_content = content[:match.start()] + f'<script type="module" src="{src_attr_path}"></script>' + content[match.end():]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Extracted from {filepath} to {dest_js_path}')
    else:
        print(f'No inline module script found in {filepath}')

extract_inline_module('index.html', 'src/main.js', './src/main.js')
extract_inline_module('login.html', 'src/login.js', './src/login.js')
extract_inline_module('about.html', 'src/about.js', './src/about.js')
extract_inline_module('admin/index.html', 'admin/admin-init.js', './admin-init.js')
