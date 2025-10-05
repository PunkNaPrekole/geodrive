project = 'geodrive'
copyright = '2025, punk_na_prekole'
author = 'punk_na_prekole'
version = '0.1.0'
release = '0.1.0'


extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx_autodoc_typehints',
    'sphinx_material',
    'sphinx_design',
]

autodoc_member_order = 'bysource'
always_document_param_types = True
source_suffix = {'.rst': 'restructuredtext'}
master_doc = 'index'
language = 'en'
html_show_sourcelink = False
todo_include_todos = False
add_module_names = False
html_sidebars = {
    '**': [
        'globaltoc.html',  # Основное оглавление
        'searchbox.html',  # Поиск
        'localtoc.html'
    ]
}
# -- HTML output -------------------------------------------------------------
html_title = 'geodrive documentation'
html_theme = 'sphinx_material'
html_theme_options = {
    "nav_title": "GEODOCS",
    "color_primary": "orange",
    "color_accent": "deep-orange",
    "repo_url": "https://github.com/PunkNaPrekole/geodrive",
    "repo_name": "geodrive",
    "repo_type": "github",
    "globaltoc_depth": 3,
    "globaltoc_collapse": True,
    "heroes": {
        "index": "Python SDK для управления роботами-роверами через gRPC",
    }
}

html_static_path = ['_static']
templates_path = ['_templates']