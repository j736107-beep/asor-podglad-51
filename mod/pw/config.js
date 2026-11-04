/* Przegląd wyników – czujnik bezpieczeństwa: PROGI ALARMOWE (jeden plik do zmiany przez lekarza).
   Jednostki kanoniczne (po przeliczeniu z wklejki): Hb g/dl, WBC/PLT tys/µl, CRP mg/l, PCT ng/ml,
   kreatynina/mocznik/glukoza/bilirubina/Ca/Mg mg/dl, Na/K/HCO3/mleczany mmol/l, troponina ng/l, pCO2/pO2 mmHg, fibrynogen g/l.
   Wszystkie progi: DO DECYZJI LEKARZA (propozycja, do zatwierdzenia). */
(function(g){g.PW_CFG={
 status:'DO DECYZJI LEKARZA',
 hb:{crit:7,alert:8,dropAlert:2},            // g/dl; spadek ≥2 g/dl między pobraniami
 k:{critHi:6.5,alertHi:6.0,warnHi:5.5,alertLo:3.0,critLo:2.5},
 na:{critLo:120,alertLo:125,alertHi:150,critHi:160},
 ph:{crit:7.2,alert:7.3,alertHi:7.55},
 lac:{alert:2,crit:4},
 pct:{warn:0.5,alert:2},
 crp:{warn:100,riseX:2,riseMin:50},          // podwojenie przy ostatnim ≥50 mg/l
 wbc:{alertHi:12,critHi:30,alertLo:4,critLo:1},
 crea:{riseAbs:0.3,riseX:1.5,alert:2.0},      // KDIGO: wzrost ≥0,3 mg/dl lub ×1,5
 egfr:{alert:30},
 trop:{riseRel:0.5,critX:5},                  // względem górnej granicy normy z wklejki
 glu:{critLo:54,alertLo:70,alertHi:250,critHi:400},
 inr:{alert:3,crit:5},
 plt:{alert:50,crit:20},
 fib:{alert:1.5},
 bil:{alert:3},
 lip:{alertX:3,ulnDefault:60},                // ×GGN; gdy brak normy we wklejce – 60 U/l
 ast:{alertX:5},
 ca:{critLo:7,alertHi:12},
 mg:{alertLo:1.2},
 ck:{alert:5000},
 pco2:{alertHi:50}
};})(typeof window!=='undefined'?window:globalThis);
