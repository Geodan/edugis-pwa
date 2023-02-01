set search_path=plllbronnen,public;

-- cbs_buurten
drop table if exists cbs_buurten;
CREATE table cbs_buurten (
	ogc_fid serial4 NOT NULL,
	bu_code varchar NULL,
	bu_naam varchar NULL,
	wk_code varchar NULL,
	gm_code varchar NULL,
	gm_naam varchar NULL,
	ind_wbi int8 NULL,
	h2o varchar NULL,
	postcode varchar NULL,
	dek_perc int8 NULL,
	oad int8 NULL,
	sted int8 NULL,
	bev_dichth int8 NULL,
	aant_inw int8 NULL,
	aant_man int8 NULL,
	aant_vrouw int8 NULL,
	p_00_14_jr int8 NULL,
	p_15_24_jr int8 NULL,
	p_25_44_jr int8 NULL,
	p_45_64_jr int8 NULL,
	p_65_eo_jr int8 NULL,
	p_ongehuwd int8 NULL,
	p_gehuwd int8 NULL,
	p_gescheid int8 NULL,
	p_verweduw int8 NULL,
	aantal_hh int8 NULL,
	p_eenp_hh int8 NULL,
	p_hh_z_k int8 NULL,
	p_hh_m_k int8 NULL,
	gem_hh_gr float8 NULL,
	p_west_al int8 NULL,
	p_n_w_al int8 NULL,
	p_marokko int8 NULL,
	p_ant_aru int8 NULL,
	p_surinam int8 NULL,
	p_turkije int8 NULL,
	p_over_nw int8 NULL,
	opp_tot int8 NULL,
	opp_land int8 NULL,
	opp_water int8 NULL,
	jrstatcode varchar NULL,
	jaar int4 NULL,
	shape_leng float8 NULL,
	shape_area float8 NULL,
	geom public.geometry(multipolygon, 28992) NULL,
	CONSTRAINT cbs_buurt_pkey PRIMARY KEY (ogc_fid)
);
CREATE INDEX cbs_buurten_geomidx ON cbs_buurten USING gist (geom);

COMMENT ON TABLE cbs_buurten IS 'bron: CBS wijk en buurtkaart 2020, buurt_2022_v1.shp, https://www.cbs.nl/nl-nl/dossier/nederland-regionaal/geografische-data/wijk-en-buurtkaart-2022. Where naam=''Prinsenland'' or naam=''Het Lage Land''';
COMMENT ON COLUMN cbs_buurten.bu_code IS 'cbs buurtcode, prefix BU';
COMMENT ON COLUMN cbs_buurten.bu_naam IS 'buurt naam';
COMMENT ON COLUMN cbs_buurten.aant_inw IS 'aantal inwoners';
COMMENT ON COLUMN cbs_buurten.aant_man IS 'aantal mannen';
COMMENT ON COLUMN cbs_buurten.aant_vrouw IS 'aantal vrouwen';
COMMENT ON COLUMN cbs_buurten.aantal_hh IS 'aantal huishoudens';
COMMENT ON COLUMN cbs_buurten.p_eenp_hh IS 'percentage eenpersoons huishoudens';
COMMENT ON COLUMN cbs_buurten.p_hh_z_k IS 'percentage huishoudens zonder kinderen';
COMMENT ON COLUMN cbs_buurten.p_hh_m_k IS 'precentage huishoudens met kinderen';
COMMENT ON COLUMN cbs_buurten.gem_hh_gr IS 'gemiddelde huishoudensgrootte';
COMMENT ON COLUMN cbs_buurten.geom IS 'buurtgrens, polygoon 28992';
INSERT INTO cbs_buurten
(bu_code, bu_naam, wk_code, gm_code, gm_naam, ind_wbi, h2o, postcode, dek_perc, oad, sted, bev_dichth, aant_inw, aant_man, aant_vrouw, p_00_14_jr, p_15_24_jr, p_25_44_jr, p_45_64_jr, p_65_eo_jr, p_ongehuwd, p_gehuwd, p_gescheid, p_verweduw, aantal_hh, p_eenp_hh, p_hh_z_k, p_hh_m_k, gem_hh_gr, p_west_al, p_n_w_al, p_marokko, p_ant_aru, p_surinam, p_turkije, p_over_nw, opp_tot, opp_land, opp_water, jrstatcode, jaar, shape_leng, shape_area, geom)
select bu_code, bu_naam, wk_code, gm_code, gm_naam, ind_wbi, h2o, postcode, dek_perc, oad, sted, bev_dichth, aant_inw, aant_man, aant_vrouw, p_00_14_jr, p_15_24_jr, p_25_44_jr, p_45_64_jr, p_65_eo_jr, p_ongehuwd, p_gehuwd, p_gescheid, p_verweduw, aantal_hh, p_eenp_hh, p_hh_z_k, p_hh_m_k, gem_hh_gr, p_west_al, p_n_w_al, p_marokko, p_ant_aru, p_surinam, p_turkije, p_over_nw, opp_tot, opp_land, opp_water, jrstatcode, jaar, shape_leng, shape_area, geom
 from anneb.buurt_2022_v1 
   where (bu_naam='Prinsenland' or bu_naam='Het Lage Land') and gm_naam='Rotterdam';


-- BAG panden
drop table if exists pand;
create table pand (like bag20221203.pand including comments);
insert into pand (id, identificatie, documentnummer, documentdatum, "pandstatus", bouwjaar, begindatumtijdvakgeldigheid, einddatumtijdvakgeldigheid, geovlak)
	select id, identificatie, documentnummer, documentdatum, "pandstatus", bouwjaar, begindatumtijdvakgeldigheid, einddatumtijdvakgeldigheid, geovlak 
	  from bag20221203.pandactueelbestaand p 
	    join cbs_buurten b on st_intersects(p.geovlak, b.geom);
create index pandgeovlakidx on pand using gist(geovlak);
comment on table pand is 'extracted from bag20221203.pand';

-- BAG verblijfsobjecten
drop table if exists verblijfsobject cascade;
create table verblijfsobject (like bag20221203.verblijfsobject including comments);
insert into verblijfsobject (id, identificatie, begindatumtijdvakgeldigheid, einddatumtijdvakgeldigheid, documentnummer, documentdatum, hoofdadres, "verblijfsobjectstatus", oppervlakteverblijfsobject, geopunt, geovlak)
	select id, identificatie, begindatumtijdvakgeldigheid, einddatumtijdvakgeldigheid, documentnummer, documentdatum, hoofdadres, "verblijfsobjectstatus", oppervlakteverblijfsobject, geopunt, geovlak 
	  from bag20221203.verblijfsobjectactueelbestaand v
	    join cbs_buurten b on st_intersects(v.geopunt, b.geom);
create index verblijfsobjectgeopuntidx on verblijfsobject using gist(geopunt);
comment on table verblijfsobject is 'extracted from bag20221203.verblijfsobject';

-- BAG standplaatsen
drop table if exists standplaats;
create table standplaats (like bag20221203.standplaats including comments);
insert into standplaats (id,identificatie, begindatumtijdvakgeldigheid, einddatumtijdvakgeldigheid, documentnummer, documentdatum, hoofdadres, "standplaatsstatus", geovlak)
	select id,identificatie, begindatumtijdvakgeldigheid, einddatumtijdvakgeldigheid, documentnummer, documentdatum, hoofdadres, "standplaatsstatus", geovlak
	  from bag20221203.standplaats v
	    join cbs_buurten b on st_intersects(v.geovlak, b.geom);
create index standplaatsgeovlakidx on standplaats using gist(geovlak);
comment on table standplaats is 'extracted from bag20221203.standplaats';


--- BAG get all nummeraanduiding records that belong to verblijfsobjecten in PLLL
--- note: nevenadressen are ignored
drop table if exists nummeraanduiding;
create table nummeraanduiding (like bag20221203.nummeraanduiding including comments);
insert into nummeraanduiding (id, identificatie, documentnummer, documentdatum, begindatumtijdvakgeldigheid, einddatumtijdvakgeldigheid, huisnummer, huisletter, huisnummertoevoeging, postcode, "nummeraanduidingstatus", "typeadresseerbaarobject", gerelateerdeopenbareruimte, gerelateerdewoonplaats)
  select n.id, n.identificatie, n.documentnummer, n.documentdatum, n.begindatumtijdvakgeldigheid, n.einddatumtijdvakgeldigheid, n.huisnummer, n.huisletter, n.huisnummertoevoeging, n.postcode, n."nummeraanduidingstatus", n."typeadresseerbaarobject", n.gerelateerdeopenbareruimte, n.gerelateerdewoonplaats
    from bag20221203.nummeraanduidingactueelbestaand n 
      join verblijfsobject v on (v.hoofdadres=n.identificatie)
  union 
   select n2.id, n2.identificatie, n2.documentnummer, n2.documentdatum, n2.begindatumtijdvakgeldigheid, n2.einddatumtijdvakgeldigheid, n2.huisnummer, n2.huisletter, n2.huisnummertoevoeging, n2.postcode, n2."nummeraanduidingstatus", n2."typeadresseerbaarobject", n2.gerelateerdeopenbareruimte, n2.gerelateerdewoonplaats
     from bag20221203.nummeraanduidingactueelbestaand n2
       join standplaats s on (s.hoofdadres = n2.identificatie);

-- BAG get all openbareruimte used in nummeraanduiding
drop table if exists openbareruimte;
create table openbareruimte (like bag20221203.openbareruimteactueelbestaand including comments);
insert into openbareruimte
  select distinct o.*
    from bag20221203.openbareruimteactueelbestaand o
      join nummeraanduiding n on (n.gerelateerdeopenbareruimte=o.identificatie);

-- BAG get all woonplaats used in openbareruimte
drop table if exists woonplaats;
create table woonplaats (like bag20221203.woonplaatsactueelbestaand including comments);
insert into woonplaats
  select distinct w.*
    from bag20221203.woonplaatsactueelbestaand w
      join openbareruimte o on (o.gerelateerdewoonplaats=w.identificatie);

-- BAG get relation table bag20221203.verblijfsobjectpandactueelbestaand 
drop table if exists verblijfsobjectpand;
create table verblijfsobjectpand (id serial4, identificatie varchar(16), begindatumtijdvakgeldigheid timestamptz, einddatumtijdvakgeldigheid timestamptz, verblijfsobjectstatus varchar, gerelateerdpand varchar(16));
insert into verblijfsobjectpand
  select vp.id, vp.identificatie, vp.begindatumtijdvakgeldigheid, vp.einddatumtijdvakgeldigheid, vp."verblijfsobjectstatus", vp.gerelateerdpand 
    from bag20221203.verblijfsobjectpandactueelbestaand vp
      join verblijfsobject v on (vp.identificatie=v.identificatie);

-- BAG get relation tabel bag20221203.verblijfsobjectgebruiksdoel
drop table if exists verblijfsobjectgebruiksdoel;
create table verblijfsobjectgebruiksdoel (like bag20221203.verblijfsobjectgebruiksdoelactueelbestaand);
insert into verblijfsobjectgebruiksdoel
 select d.* from bag20221203.verblijfsobjectgebruiksdoelactueelbestaand d
  join verblijfsobject v on (v.identificatie = d.identificatie) ; 

-- hoogtestatistieken gebouwen
drop table if exists "2020_hoogtestatistieken_gebouwen";
create table "2020_hoogtestatistieken_gebouwen" as 
select 
	id, 
	fid, 
	identificatie, 
	dd_id, 
	h_maaiveld, 
	dd_h_dak_min, 
	dd_h_dak_50p, 
	dd_h_dak_70p, 
	dd_h_dak_max, 
	dd_data_coverage, 
	dak_type, 
	pw_datum, 
	pw_actueel, 
	pw_bron, 
	reconstructie_methode, 
	versie_methode, 
	kas_warenhuis, 
	ondergronds_type, 
	kwaliteits_klasse, 
	rmse, 
	objectid, 
	aanduidingrecordinactief, 
	aanduidingrecordcorrectie, 
	officieel, 
	inonderzoek, 
	documentnummer, 
	documentdatum, 
	"pandstatus", 
	bouwjaar, 
	begindatumtijdvakgeldigheid, 
	einddatumtijdvakgeldigheid, 
	bagpandid,
	st_transform(h.geom,28992) geom 
from anneb."3d_hoogtestatistieken_gebouwen" h
	join cbs_buurten b on st_intersects(st_transform(h.geom,28992), b.geom);
create index "2020_hoogtestatistiekengebouwen_geomidx" on "2020_hoogtestatistieken_gebouwen" using gist(geom);
COMMENT ON TABLE plllbronnen."2020_hoogtestatistieken_gebouwen" IS 'imported with pgbrowser (https://github.com/geodan/pgbrowser) from 2020_3d_hoogtestatistieken_gebouwen.zip file 2020_3d_hoogtestatistieken_gebouwen.gpkg';

-- cbs kerncijfers 2020 per postcode
drop table if exists cbs_pc6_2020_v1;
create table cbs_pc6_2020_v1 (like anneb.cbs_pc6_2020_v1 including comments);
insert into cbs_pc6_2020_v1
SELECT 
    p.ogc_fid, 
    pc6,
    case when inwoner < 0 then NULL else inwoner end inwoner,
    case when man < 0 then NULL else man end man,
    case when vrouw < 0 then NULL else vrouw end vrouw,
    case when inw_014 < 0 then NULL else inw_014 end inw_014,
    case when inw_1524 < 0 then NULL else inw_1524 end inw_1524,
    case when inw_2544 < 0 then NULL else inw_2544 end inw_2544,
    case when inw_4564 < 0 then NULL else inw_4564 end inw_4564,
    case when inw_65pl < 0 then NULL else inw_65pl end inw_65pl,
    case when p_nl_achtg < 0 then NULL else p_nl_achtg end p_nl_achtg,
    case when p_we_mig_a < 0 then NULL else p_we_mig_a end p_we_mig_a,
    case when p_nw_mig_a < 0 then NULL else p_nw_mig_a end p_nw_mig_a,
    case when p.aantal_hh < 0 then NULL else p.aantal_hh end aantal_hh,
    case when tothh_eenp < 0 then NULL else tothh_eenp end tothh_eenp,
    case when tothh_mpzk < 0 then NULL else tothh_mpzk end tothh_mpzk,
    case when hh_eenoud < 0 then NULL else hh_eenoud end hh_eenoud,
    case when hh_tweeoud < 0 then NULL else hh_tweeoud end hh_tweeoud,
    case when p.gem_hh_gr < 0 then NULL else p.gem_hh_gr end gem_hh_gr,
    case when woning < 0 then NULL else woning end woning,
    case when wonvoor45 < 0 then NULL else wonvoor45 end wonvoor45,
    case when won_4564 < 0 then NULL else won_4564 end won_4564,
    case when won_6574 < 0 then NULL else won_6574 end won_6574,
    case when won_7584 < 0 then NULL else won_7584 end won_7584,
    case when won_8594 < 0 then NULL else won_8594 end won_8594,
    case when won_9504 < 0 then NULL else won_9504 end won_9504,
    case when won_0514 < 0 then NULL else won_0514 end won_0514,
    case when won_1524 < 0 then NULL else won_1524 end won_1524,
    case when won_mrgez < 0 then NULL else won_mrgez end won_mrgez,
    case when p_koopwon < 0 then NULL else p_koopwon end p_koopwon,
    case when p_huurwon < 0 then NULL else p_huurwon end p_huurwon,
    case when won_hcorp < 0 then NULL else won_hcorp end won_hcorp,
    case when won_nbew < 0 then NULL else won_nbew end won_nbew,
    case when wozwoning < 0 then NULL else wozwoning end wozwoning,
    case when uitkminaow < 0 then NULL else uitkminaow end uitkminaow,
    p.geom
FROM anneb.cbs_pc6_2020_v1 p join (select st_union(geom) geom from cbs_buurten) b on st_intersects(p.geom, b.geom);

-- cbs energie per postode 2021, publicatiefile_energie_postcode_2021
drop table if exists publicatiefile_energie_postcode6_2021;
create table publicatiefile_energie_postcode6_2021 (like anneb.publicatiefile_energie_postcode6_2021 including comments);
insert into publicatiefile_energie_postcode6_2021
  select e.* 
    from anneb.publicatiefile_energie_postcode6_2021 e
      join cbs_pc6_2020_v1 p on (e.postcode6=p.pc6);

-- rvo energielabels 1 jan 2023
drop table if exists v20230101_v2_csv;
create table v20230101_v2_csv (like anneb.v20230101_v2_csv including comments);
insert into v20230101_v2_csv
  select el.*
    from anneb.v20230101_v2_csv el
      join cbs_pc6_2020_v1 p on (el.pand_postcode = p.pc6);

-- stedin gasleidingen 1-1-2022
drop table if exists gasvervangingsdata; 
create table gasvervangingsdata (like anneb.gasvervangingsdata including comments);
insert into gasvervangingsdata
  select g.*
    from anneb.gasvervangingsdata g 
	  join cbs_buurten b on (st_intersects(st_buffer(b.geom,200), g.geom));
create index gasvervangingsdatageomidx on gasvervangingsdata using gist(geom);


-- steding hoogspanning 28 jan 2022
drop table if exists hoogspanningsverbindingen;
create table hoogspanningsverbindingen (like anneb.hoogspanningsverbindingen including comments);
insert into hoogspanningsverbindingen
  select h.*
    from anneb.hoogspanningsverbindingen h
	  join cbs_buurten b on (st_intersects(b.geom, h.geom));

-- steding middenspanning 28 jan 2022
drop table if exists middenspanningsverbindingen;
create table middenspanningsverbindingen (like anneb.middenspanningsverbindingen including comments);
insert into middenspanningsverbindingen
  select h.*
    from anneb.middenspanningsverbindingen h
	  join cbs_buurten b on (st_intersects(b.geom, h.geom));

-- steding laagspanning 28 jan 2022
drop table if exists laagspanningsverbindingen;
create table laagspanningsverbindingen (like anneb.laagspanningsverbindingen including comments);
insert into laagspanningsverbindingen
  select h.*
    from anneb.laagspanningsverbindingen h
	  join cbs_buurten b on (st_intersects(b.geom, h.geom));

-- dakvlakken
-- to prevent copying 95 GB data, create the PLLL dakvlakken tabel in the pico database, then export to plllbronnen
-- pg_dump -h localhost -d research -t plllbronnen.cbs_buurten > cbs_buurten.sql
-- psql -h localhost -d pico -c "create schema plllbronnen;"
-- psql -h localhost -d pico < cbs_buurten.sql
-- psql -h localhost -d pico -c "create table plllbronnen.dakdelen as select d.* from dakdelen_2018.dakdelen d join plllbronnen.cbs_buurten b on (st_intersects(b.geom, d.geom));"


-- kadaster_pc6_bezitsverhoudingen
drop table if exists kadaster_pc6_bezitsverhoudingen;
create table kadaster_pc6_bezitsverhoudingen (like anneb.kadaster_pc6_bezitsverhoudingen_geo_json);
with postcodes as (
	select postcode from nummeraanduiding group by postcode
)
insert into kadaster_pc6_bezitsverhoudingen
select k.* from anneb.kadaster_pc6_bezitsverhoudingen_geo_json k
  join postcodes p on (k.postcode=p.postcode);

