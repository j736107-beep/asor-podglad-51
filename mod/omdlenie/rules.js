/* wygenerowane z rules.json */
window.RULES={
 "version": "3.0 (karta projektu v0.1, 14.10.2026)",
 "groups": [
  {
   "id": "K",
   "title": "Kwalifikacja",
   "items": [
    {
     "code": "K-1",
     "label": "Wiek ≥16 lat",
     "type": "incl",
     "src": "CSRS CMAJ 2016 (kryteria włączenia)",
     "req": "always"
    },
    {
     "code": "K-1T",
     "label": "Zgłoszenie ≤24 h od zdarzenia",
     "type": "incl",
     "req": "always",
     "src": "CSRS CMAJ 2016 (kryteria włączenia)"
    },
    {
     "code": "K-2",
     "label": "T-LOC >5 min",
     "type": "excl",
     "src": "CSRS CMAJ 2016 (wyłączenie)",
     "req": "always"
    },
    {
     "code": "K-3",
     "label": "Zmiana stanu psychicznego po zdarzeniu",
     "type": "excl",
     "src": "CSRS CMAJ 2016 (wyłączenie)",
     "req": "always"
    },
    {
     "code": "K-4",
     "label": "Oczywisty, obserwowany napad padaczkowy",
     "type": "excl",
     "src": "CSRS CMAJ 2016 (wyłączenie)",
     "req": "always"
    },
    {
     "code": "K-5",
     "label": "Uraz głowy z utratą przytomności / poważny uraz wymagający przyjęcia",
     "type": "excl",
     "src": "CSRS CMAJ 2016; JAMA IM 2020",
     "req": "always"
    },
    {
     "code": "K-6",
     "label": "Intoksykacja alkoholem lub substancjami",
     "type": "excl",
     "src": "CSRS CMAJ 2016 (wyłączenie)",
     "req": "always"
    },
    {
     "code": "K-7",
     "label": "Poważna przyczyna rozpoznana już na SOR (OZW, ZTP, krwawienie, arytmia)",
     "type": "excl",
     "src": "CSRS CMAJ 2016; ESC 2018 Tab. 6 przyp. a",
     "req": "always"
    }
   ]
  },
  {
   "id": "E",
   "title": "Zdarzenie",
   "items": [
    {
     "code": "E-L1",
     "label": "Prodromy typowe dla omdlenia odruchowego (lekkość w głowie, gorąco, poty, nudności, wymioty)",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "E-L2",
     "label": "Po nagłym nieprzyjemnym widoku, dźwięku, zapachu lub bólu",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "E-L3",
     "label": "Po długim staniu lub w zatłoczonym, gorącym miejscu",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "E-L4",
     "label": "W czasie posiłku lub po posiłku",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "E-L5",
     "label": "Wywołane kaszlem, defekacją lub mikcją",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "E-L6",
     "label": "Przy rotacji głowy / ucisku zatoki szyjnej (guz, golenie, ciasny kołnierzyk)",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "E-L7",
     "label": "Po wstaniu z pozycji leżącej/siedzącej",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "E-H1",
     "label": "Nowy ból/dyskomfort w klatce, duszność, ból brzucha lub ból głowy",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "always"
    },
    {
     "code": "E-H2",
     "label": "Omdlenie w czasie wysiłku lub w pozycji leżącej",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "always"
    },
    {
     "code": "E-H3",
     "label": "Nagłe kołatanie serca bezpośrednio przed omdleniem",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "always"
    },
    {
     "code": "E-M1",
     "label": "Brak objawów ostrzegawczych lub krótki (<10 s) prodrom",
     "type": "minorEvent",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "always"
    },
    {
     "code": "E-M2",
     "label": "Wywiad rodzinny nagłego zgonu sercowego w młodym wieku",
     "type": "minorEvent",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "always"
    },
    {
     "code": "E-M3",
     "label": "Omdlenie w pozycji siedzącej",
     "type": "minorEvent",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "always"
    },
    {
     "code": "X-PRE",
     "label": "Stan przedomdleniowy (bez pełnej utraty przytomności)",
     "type": "flag",
     "src": "ESC 2018 s. 1896",
     "req": "opt"
    }
   ]
  },
  {
   "id": "W",
   "title": "Wywiad",
   "items": [
    {
     "code": "W-H1",
     "label": "Ciężka strukturalna choroba serca / choroba wieńcowa (HF, niska LVEF, przebyty zawał)",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "always"
    },
    {
     "code": "C-2",
     "label": "CSRS: wywiad choroby serca (wieńcowa, zastawkowa, kardiomiopatia, HF, rytm niezatokowy, urządzenie)",
     "type": "csrs",
     "pts": 1,
     "src": "CSRS CMAJ 2016",
     "req": "always"
    },
    {
     "code": "C-1",
     "label": "CSRS: predyspozycja do objawów wazowagalnych (ciepło, tłok, stanie, strach, emocje, ból)",
     "type": "csrs",
     "pts": -1,
     "src": "CSRS CMAJ 2016",
     "req": "always"
    },
    {
     "code": "W-L1",
     "label": "Wieloletni wywiad nawracających omdleń niskiego ryzyka o tej samej charakterystyce",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "opt"
    },
    {
     "code": "X-OLD",
     "label": "Starszy wiek (≥ progu z Ustawień)",
     "type": "flag",
     "src": "ACC/AHA/HRS 2017",
     "req": "opt"
    }
   ]
  },
  {
   "id": "B",
   "title": "Badanie",
   "items": [
    {
     "code": "B-L1",
     "label": "Prawidłowe badanie przedmiotowe",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "B-H1",
     "label": "Niewyjaśnione SBP na SOR <90 mmHg",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "always"
    },
    {
     "code": "B-H2",
     "label": "Podejrzenie krwawienia z p. pokarmowego w badaniu per rectum",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "always"
    },
    {
     "code": "B-H3",
     "label": "Utrzymująca się bradykardia <40/min w czuwaniu (bez treningu)",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "always"
    },
    {
     "code": "B-H4",
     "label": "Niezdiagnozowany szmer skurczowy",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "always"
    },
    {
     "code": "C-3",
     "label": "CSRS: jakikolwiek pomiar SBP <90 lub >180 mmHg (triaż → dyspozycja)",
     "type": "csrs",
     "pts": 2,
     "src": "CSRS CMAJ 2016",
     "req": "always"
    },
    {
     "code": "B-O1",
     "label": "Ortostatyczny spadek SBP ≥20 / DBP ≥10 mmHg lub SBP <90 (z objawami)",
     "type": "info",
     "src": "ESC 2018 s. 1902 (informacyjnie)",
     "req": "opt"
    }
   ]
  },
  {
   "id": "G",
   "title": "EKG",
   "items": [
    {
     "code": "G-L1",
     "label": "EKG prawidłowe (TAK = wszystkie nieprawidłowości EKG i elementy EKG w CSRS = NIE)",
     "type": "low",
     "src": "ESC 2018 Tab. 6",
     "req": "always"
    },
    {
     "code": "G-H1",
     "label": "Zmiany wskazujące na ostre niedokrwienie",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-H2",
     "label": "Blok AV II° Mobitz II lub blok AV III°",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-H3",
     "label": "Wolne AF (<40/min)",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-H4",
     "label": "Bradykardia zatokowa <40/min, blok SA lub pauzy >3 s w czuwaniu",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-H5",
     "label": "Blok odnogi, zab. przewodzenia śródkomorowego, przerost komory lub Q (niedokrwienie/kardiomiopatia)",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-H6",
     "label": "Utrwalony lub nieutrwalony VT",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-H7",
     "label": "Dysfunkcja stymulatora / ICD",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-H8",
     "label": "Wzorzec Brugadów typu 1",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-H9",
     "label": "QTc >460 ms w powtarzanych EKG (LQTS)",
     "type": "major",
     "src": "ESC 2018 Tab. 6 (duża)",
     "req": "ecg"
    },
    {
     "code": "G-M1",
     "label": "Blok AV II° Mobitz I lub blok AV I° ze znacznie wydłużonym PR",
     "type": "minorEcg",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "ecg"
    },
    {
     "code": "G-M2",
     "label": "Bezobjawowa łagodna bradykardia zatokowa 40–50/min lub wolne AF 40–50/min",
     "type": "minorEcg",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "ecg"
    },
    {
     "code": "G-M3",
     "label": "Napadowy SVT lub migotanie przedsionków",
     "type": "minorEcg",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "ecg"
    },
    {
     "code": "G-M4",
     "label": "Preekscytacja QRS",
     "type": "minorEcg",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "ecg"
    },
    {
     "code": "G-M5",
     "label": "Krótki QTc (≤340 ms)",
     "type": "minorEcg",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "ecg"
    },
    {
     "code": "G-M6",
     "label": "Atypowe wzorce Brugadów",
     "type": "minorEcg",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "ecg"
    },
    {
     "code": "G-M7",
     "label": "Ujemne T w prawych przedsercowych, fale epsilon (ARVC)",
     "type": "minorEcg",
     "src": "ESC 2018 Tab. 6 (mała)",
     "req": "ecg"
    },
    {
     "code": "X-ARR",
     "label": "Lekarz: wywiad zgodny z omdleniem arytmicznym",
     "type": "flag",
     "src": "ESC 2018 Tab. 6",
     "req": "arr"
    },
    {
     "code": "C-5",
     "label": "CSRS: oś QRS <−30° lub >100°",
     "type": "csrs",
     "pts": 1,
     "src": "CSRS CMAJ 2016",
     "req": "ecg"
    },
    {
     "code": "C-6",
     "label": "CSRS: QRS >130 ms",
     "type": "csrs",
     "pts": 1,
     "src": "CSRS CMAJ 2016",
     "req": "ecg"
    },
    {
     "code": "C-7",
     "label": "CSRS: QTc >480 ms",
     "type": "csrs",
     "pts": 2,
     "src": "CSRS CMAJ 2016",
     "req": "ecg"
    }
   ]
  },
  {
   "id": "L",
   "title": "CSRS i laboratorium",
   "items": [
    {
     "code": "L-HB",
     "label": "Hb/Hct obniżone (np. Hct <30%)",
     "type": "lab",
     "setting": "P4_hb",
     "src": "SFSR (Hct <30%) – próg DO WERYFIKACJI",
     "req": "opt"
    },
    {
     "code": "L-BNP",
     "label": "BNP / NT-proBNP podwyższone",
     "type": "lab",
     "setting": "P5_bnp",
     "src": "ESC 2018 rozdz. 4.2.7; ROSE – próg DO WERYFIKACJI",
     "req": "opt"
    }
   ]
  },
  {
   "id": "M",
   "title": "Modyfikatory przyjęcia",
   "items": [
    {
     "code": "M-1",
     "label": "Istotna choroba współistniejąca wymagająca przyjęcia",
     "type": "mod",
     "src": "ESC 2018 Tab. 7",
     "req": "always"
    },
    {
     "code": "M-2",
     "label": "Uraz spowodowany omdleniem",
     "type": "mod",
     "src": "ESC 2018 Tab. 7",
     "req": "always"
    },
    {
     "code": "M-3",
     "label": "Względy socjalne / brak opieki",
     "type": "mod",
     "src": "ESC 2018 Ryc. 6 przyp. b",
     "req": "always"
    }
   ]
  }
 ],
 "troponin": {
  "code": "C-4",
  "pts": 2,
  "label": "CSRS: troponina >99. percentyla",
  "src": "CSRS CMAJ 2016"
 },
 "diagnosis": {
  "other": {
   "code": "C-0",
   "pts": 0,
   "label": "Inne / niejasne (0 pkt)"
  },
  "vaso": {
   "code": "C-8",
   "pts": -2,
   "label": "Wazowagalne (−2)"
  },
  "cardiac": {
   "code": "C-9",
   "pts": 2,
   "label": "Kardiogenne (+2)"
  }
 },
 "csrsTable": {
  "-3": [
   0.4,
   "bardzo niskie"
  ],
  "-2": [
   0.7,
   "bardzo niskie"
  ],
  "-1": [
   1.2,
   "niskie"
  ],
  "0": [
   1.9,
   "niskie"
  ],
  "1": [
   3.1,
   "średnie"
  ],
  "2": [
   5.1,
   "średnie"
  ],
  "3": [
   8.1,
   "średnie"
  ],
  "4": [
   12.9,
   "wysokie"
  ],
  "5": [
   19.7,
   "wysokie"
  ],
  "6": [
   28.9,
   "bardzo wysokie"
  ],
  "7": [
   40.3,
   "bardzo wysokie"
  ],
  "8": [
   52.8,
   "bardzo wysokie"
  ],
  "9": [
   65.0,
   "bardzo wysokie"
  ],
  "10": [
   75.5,
   "bardzo wysokie"
  ],
  "11": [
   83.6,
   "bardzo wysokie"
  ]
 },
 "defaults": {
  "P1_splitRed": false,
  "P2_csrsRed": true,
  "P3_csrsGreenMax": 0,
  "P4_hb": "yellow",
  "P5_bnp": "yellow",
  "P6_tropMissing": "zero",
  "P7_presyncope": "warn",
  "P9_requireLow": true,
  "P10_ageThreshold": 65,
  "P10_ageEffect": "warn",
  "P_sound": true
 },
 "downgradeReasons": [
  "Znana, udokumentowana przyczyna łagodna",
  "Prawidłowe wyniki dodatkowych badań (monitor, echo)",
  "Po konsultacji kardiologicznej",
  "Świadoma decyzja pacjenta po informacji",
  "Inne – udokumentowane w historii choroby"
 ]
};
