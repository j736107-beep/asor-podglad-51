/* Ostateczny hamulec – LISTA REGUŁ (wszystkie: DO DECYZJI LEKARZA – do zatwierdzenia). Poziomy: crit = NIE WOLNO WYPISAĆ, warn = UWAGA. */
(function(g){g.HB_RULES={status:'DO DECYZJI LEKARZA',
 vit:[['sbp','<',90,'crit','Ciśnienie skurczowe < 90 mmHg'],['hr','>',120,'crit','Tętno > 120/min'],['hr','<',40,'crit','Tętno < 40/min'],['spo2','<',90,'crit','SpO₂ < 90%'],['gcs','<',15,'crit','GCS < 15'],['rr','>',24,'warn','Oddechy > 24/min'],['rr','<',9,'crit','Oddechy < 9/min'],['temp','>=',39,'warn','Temperatura ≥ 39 °C'],['temp','<',35,'crit','Temperatura < 35 °C'],['sbp','>=',220,'warn','Ciśnienie skurczowe ≥ 220 mmHg']],
 news:{crit:7,warn:5},
 kw:[ // [id, etykieta, poziom, wzorzec]
  ['bkl','Ból w klatce piersiowej','warn','ból[a-ząęółśżźćń]* (?:w )?klat[a-ząęółśżźćń]*|ból[a-ząęółśżźćń]* zamostkow[a-ząęółśżźćń]*|ucisk[a-ząęółśżźćń]* (?:w|za) mostk[a-ząęółśżźćń]*|dławic[a-ząęółśżźćń]*'],
  ['dus','Duszność','warn','duszno[a-ząęółśżźćń]*|dyspnoe'],
  ['omd','Omdlenie / utrata przytomności','warn','omdle[a-ząęółśżźćń]*|utrat[a-ząęółśżźćń]* przytomno[a-ząęółśżźćń]*|syncope'],
  ['krw','Krwawienie','warn','krwawieni[a-ząęółśżźćń]*|krwotok[a-ząęółśżźćń]*|krwioplu[a-ząęółśżźćń]*|krwiomocz'],
  ['gi','Krwawienie z przewodu pokarmowego (fusowate / smoliste)','crit','fusowat[a-ząęółśżźćń]*|smolist[a-ząęółśżźćń]*|melena|krwist[a-ząęółśżźćń]* wymiot[a-ząęółśżźćń]*|hematemesis'],
  ['neuro','Deficyt neurologiczny','crit','niedowład[a-ząęółśżźćń]*|deficyt[a-ząęółśżźćń]* neurolog[a-ząęółśżźćń]*|afazj[a-ząęółśżźćń]*|asymetri[a-ząęółśżźćń]* (?:twarzy|kącika)|opadnięt[a-ząęółśżźćń]* kącik[a-ząęółśżźćń]*|zaburzeni[a-ząęółśżźćń]* mowy|porażeni[a-ząęółśżźćń]*'],
  ['kark','Sztywność karku / objawy oponowe','crit','sztywno[a-ząęółśżźćń]* karku|objaw[a-ząęółśżźćń]* oponow[a-ząęółśżźćń]*|objaw[a-ząęółśżźćń]* kerniga|objaw[a-ząęółśżźćń]* brudzi[a-ząęółśżźćń]*'],
  ['otrz','Objawy otrzewnowe','crit','objaw[a-ząęółśżźćń]* otrzewnow[a-ząęółśżźćń]*|objaw[a-ząęółśżźćń]* blumberga|deskowat[a-ząęółśżźćń]*|obron[a-ząęółśżźćń]* mięśniow[a-ząęółśżźćń]*|otrzewn[a-ząęółśżźćń]* podrażn[a-ząęółśżźćń]*'],
  ['sam','Myśli / zamiar samobójczy','crit','myśl[a-ząęółśżźćń]* samobójcz[a-ząęółśżźćń]*|zamiar[a-ząęółśżźćń]* samobójcz[a-ząęółśżźćń]*|próba samobójcz[a-ząęółśżźćń]*|tendencj[a-ząęółśżźćń]* samobójcz[a-ząęółśżźćń]*|chce się zabić|samookalecz[a-ząęółśżźćń]*'],
  ['gor','Gorączka','warn','gorączk[a-ząęółśżźćń]*|stan[a-ząęółśżźćń]* podgorączk[a-ząęółśżźćń]*|dreszcz[a-ząęółśżźćń]*'],
  ['bglow','Nagły silny ból głowy („najsilniejszy w życiu”)','crit','najsilniejsz[a-ząęółśżźćń]* ból[a-ząęółśżźćń]* głowy|piorunujący ból głowy|nagły[a-ząęółśżźćń]* (?:silny[a-ząęółśżźćń]* )?ból[a-ząęółśżźćń]* głowy'],
  ['drg','Drgawki','warn','drgawk[a-ząęółśżźćń]*|napad[a-ząęółśżźćń]* padaczk[a-ząęółśżźćń]*'],
  ['ciaza','Ciąża','info','ciąż[ayęe][a-ząęółśżźćń]*|ciężarn[a-ząęółśżźćń]*|\\d+\\s*(?:tc|hbd)\\b']
 ],
 combo:[['ciaza+bol','Ciąża + ból brzucha / krwawienie z dróg rodnych','crit'],['gor+hipot','Gorączka + hipotensja (podejrzenie wstrząsu septycznego)','crit'],['bkl+trop','Ból w klatce + troponina niejednoznaczna / podwyższona','crit']],
 miss:[['bkl','ekg','Ból w klatce bez EKG w dokumentacji'],['bkl','trop2','Ból w klatce bez 2. oznaczenia troponiny (schemat 0/1/3 h)'],['omd','ekg','Omdlenie bez EKG'],['neuro','tkg','Deficyt neurologiczny bez TK głowy / konsultacji neurologicznej'],['bglow','tkg','Nagły ból głowy bez TK głowy'],['gi','hb','Krwawienie z p.pok. bez morfologii (Hb)'],['krw','hb','Krwawienie bez morfologii (Hb)'],['gor','lac','Gorączka bez mleczanów / CRP / PCT'],['dus','gaz','Duszność bez gazometrii / SpO₂'],['ciaza','usg','Ciąża z dolegliwościami bez USG / konsultacji ginekologicznej'],['sam','psy','Myśli samobójcze bez konsultacji psychiatrycznej'],['kark','tkg','Objawy oponowe bez TK / konsultacji neurologicznej']],
 pw:'Alarmy KRYTYCZNE z Przeglądu wyników (laboratorium, troponina 14 / delta 5, D-dimery wiek / ciąża, opisy badań obrazowych) → NIE WOLNO WYPISAĆ; PILNE → UWAGA'
};})(typeof window!=='undefined'?window:globalThis);
