# Kullanım: python tools/rename_images.py <kaynak_kök_klasör>
# Kaynak klasörü (100reeds/, 1500reeds/, ... içeren klasör) mapping.csv'ye göre images/products/ altına kopyalar.
import csv,os,shutil,sys
src=sys.argv[1];root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));miss=0
for r in csv.DictReader(open(os.path.join(root,"tools","mapping.csv"),encoding="utf-8")):
    a=os.path.join(src,r["kaynak"]);b=os.path.join(root,r["yeni"])
    if os.path.exists(a):
        os.makedirs(os.path.dirname(b),exist_ok=True);shutil.copy2(a,b)
    else:miss+=1;print("Bulunamadı:",a)
print("Tamam. Eksik dosya:",miss)
