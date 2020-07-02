#!/usr/bin/env python
# coding: utf-8

# In[1]:


from pymongo import MongoClient
import sys
import requests
from bs4 import BeautifulSoup as soup
import getpass
import time
import warnings
warnings.filterwarnings("ignore")


# In[2]:


client = MongoClient('localhost', 27017)
db = client['infografis']
base_url = 'https://appportal/'

s = requests.Session()
s.verify = False
s.headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36'
}


# In[3]:


def login():
    url = base_url + 'login/login/loging_simpel'
    username = input('Enter NIP SIKKA: ') if sys.argv[1] is None else sys.argv[1]
    password = getpass.getpass('Enter Password: ') if sys.argv[2] is None else sys.argv[2]
    res = s.post(url, data={
        'username': username,
        'password': password,
        'sublogin': 'Login'
    }, allow_redirects=False)
    return res.status_code == 302


# In[4]:


def getRequest(path):
    url = base_url + path
    res = s.get(url)
    return soup(res.text)


# In[5]:


def save_data(docs):
    if len(docs) > 0:
        for i in range(len(docs)):
            mfwp = db.MFWP.find_one({ 'NPWP': docs[i]['NPWP'] }, ['KPPADM', 'NIP_AR'])
            docs[i]['KPPADM'] = mfwp['KPPADM']
            docs[i]['NIP_AR'] = mfwp['NIP_AR']
        result = db.PEMBAYARAN_MASA.insert_many(docs, ordered=False)
        return len(result.inserted_ids)
    return 0


# In[6]:


def table_to_dict(table, kpp, pilih, pasal, tahun, jenis):
    print('Generating and saving data kpp: {}, pilih: {}, pasal: {}, tahun: {}, jenis: {}...'.format(kpp, pilih, pasal, tahun, jenis))
    t1 = time.time()
    docs = []
    header = []
    if pasal in [',411125', '411126']:
        header = [
            "ANGSURAN_DLM_SPT_{}".format(tahun - 2), "ANGSURAN_DLM_SPT_{}".format(tahun - 1),
            'JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES', 'TOTAL'
        ]
    else:
        header = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES', 'TOTAL']
        
    rows = table.select('tr#tabhasil')
    for row in rows:
        data = [cell.get_text().strip().replace(',', '') for cell in row.select('td')][1:]
        npwp = data[0].replace('-','').replace('.', '')
        data = data[2:]
        if db.MFWP.find_one({ 'NPWP': npwp }, ['_id']):
            data_dict = { 'NPWP': npwp, 'PILIH': pilih, 'PASAL': pasal, 'TAHUN': tahun, 'JENIS': jenis }
            for i in range(len(header)):
                data_dict[header[i]] = int(data[i])
            docs.append(data_dict)
    print('Found {} data kpp: {}, pilih: {}, pasal: {}, tahun: {}, jenis: {}...'.format(len(docs), kpp, pilih, pasal, tahun, jenis))
    print('Trying to save {} data kpp: {}, pilih: {}, pasal: {}, tahun: {}, jenis: {}...'.format(len(docs), kpp, pilih, pasal, tahun, jenis))
    success_count = save_data(docs)
    print('{} of {} data kpp: {}, pilih: {}, pasal: {}, tahun: {}, jenis: {} successfully saved...'.format(success_count, len(docs), kpp, pilih, pasal, tahun, jenis))
    t2 = time.time()
    print('Generating and saving data kpp: {}, pilih: {}, pasal: {}, tahun: {}, jenis: {} finished in {} seconds...'.format(kpp, pilih, pasal, tahun, jenis, round(t2 - t1, 2)))
    print('\n')


# In[7]:


print('Trying to login...')
t1 = time.time()
logged_in = login()
if not logged_in:
    print('Login failed...')
    sys.exit()
t2 = time.time()
print("Login success in {} seconds...".format(round(t2 - t1, 2)))
print('\n')

print('Backing up and remove current data...')
tb1 = time.time()
db.PEMBAYARAN_MASA.aggregate([
    { '$match': {} },
    { '$out': 'PEMBAYARAN_MASA_BACKUP' }
])
db.drop_collection('PEMBAYARAN_MASA')
tb2 = time.time()
print('Backing up and remove current data finished in {} seconds...'.format(round(tb2 - tb1, 2)))

print('Generating variables...')
t3 = time.time()
html = getRequest('portal/pembayaran/index.php')
pkpp = [option.attrs['value'] for option in html.select('#dd_nas_kpp>option')]
ppilih = [1]
ppasal = [option.attrs['value'] for option in html.select('#dd_pasal>option')]
ptahun = [2019]
pjenis = [1]
t4 = time.time()
print('Variables generated in {} seconds...'.format(round(t4 - t3, 2)))
print('\n')

for kpp in pkpp:
    for pilih in ppilih:
        for pasal in ppasal:
            for tahun in ptahun:
                for jenis in pjenis:
                    print('Getting table kpp: {}, pilih: {}, pasal: {}, tahun: {}, jenis: {}...'.format(kpp, pilih, pasal, tahun, jenis))
                    t5 = time.time()
                    table = getRequest("portal/pembayaran/hasil.php?pkpp={}&ppilih={}&ppasal={}&ptahun={}&pjenis={}".format(kpp, pilih, pasal, tahun, jenis))
                    t6 = time.time()
                    print('Getting table kpp: {}, pilih: {}, pasal: {}, tahun: {}, jenis: {} success in {} seconds...'.format(kpp, pilih, pasal, tahun, jenis, round(t6 - t5, 2)))
                    print('\n')
                    table_to_dict(table, kpp, pilih, pasal, tahun, jenis)
t7 = time.time()
print('Operation finished in {} seconds...'.format(round(t7 - t1, 2)))


# In[ ]:




