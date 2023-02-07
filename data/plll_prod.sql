set search_path=plll_prod,public;

drop table if exists cbs_buurten;
create table cbs_buurten (like plllbronnen.cbs_buurten);
insert into cbs_buurten 
  select * from plllbronnen.cbs_buurten;

drop table if exists verblijfsobject;
create table verblijfsobject as
select
    v.id,
    v.identificatie,
	openbareruimtenaam,
	huisnummer,
	huisletter,
	huisnummertoevoeging,
	postcode,
	woonplaatsnaam,
	typeadresseerbaarobject,
	v.verblijfsobjectstatus::text,
	string_agg(distinct d."gebruiksdoelverblijfsobject"::text,',' order by d."gebruiksdoelverblijfsobject"::text ASC) gebruiksdoel,
	oppervlakteverblijfsobject,
	pand_opnamedatum,
	pand_opnametype, 
	pand_status, 
	pand_berekeningstype, 
	pand_energieindex, 
	pand_energieklasse, 
	pand_energielabel_is_prive, 
	pand_is_op_basis_van_referentie_gebouw, 
	pand_gebouwklasse, 
	meting_geldig_tot, 
	pand_registratiedatum, 
	pand_detailaanduiding, 
	pand_gebouwtype, 
	pand_gebouwsubtype, 
	pand_projectnaam, 
	pand_projectobject, 
	pand_sbicode, 
	pand_gebruiksoppervlakte_thermische_zone, 
	pand_energiebehoefte, 
	pand_eis_energiebehoefte, 
	pand_primaire_fossiele_energie, 
	pand_eis_primaire_fossiele_energie, 
	pand_primaire_fossiele_energie_emg_forfaitair, 
	pand_aandeel_hernieuwbare_energie, 
	pand_eis_aandeel_hernieuwbare_energie, 
	pand_aandeel_hernieuwbare_energie_emg_forfaitair, 
	pand_temperatuuroverschrijding, 
	pand_eis_temperatuuroverschrijding, 
	pand_warmtebehoefte, 
	pand_energieindex_met_emg_forfaitair,
	u.temperature uhi_temperature,
	cbs.aantal_hh cbs_aantal_hh,
	cbs.tothh_eenp cbs_tothh_eenp,
	cbs.tothh_mpzk cbs_tothh_mpzk,
	cbs.hh_eenoud cbs_hh_eenoud,
	cbs.hh_tweeoud cbs_hh_tweeoud,
	cbs.gem_hh_gr cbs_gem_hh_gr,
	cbs.p_nl_achtg cbs_p_nl_achtg,
	cbs.p_we_mig_a cbs_p_we_mig_a,
	cbs.p_nw_mig_a cbs_p_nw_mig_a,
	cbs.p_koopwon cbs_p_koopwon,
	cbs.p_huurwon cbs_p_huurwon,
	cbs.won_hcorp cbs_won_hcorp,
	cbs.wozwoning cbs_wozwoning,
	uitkminaow cbs_uitkminaow,
	geopunt geom,
	null::geometry(point,28992) geom2
  from plllbronnen.verblijfsobject v   
    join plllbronnen.nummeraanduiding n on (v.hoofdadres = n.identificatie)
     join plllbronnen.openbareruimte o on (n.gerelateerdeopenbareruimte=o.identificatie)
      join plllbronnen.woonplaats w on (o.gerelateerdewoonplaats=w.identificatie)
       join plllbronnen.verblijfsobjectgebruiksdoel d on (v.identificatie=d.identificatie)
		left join plllbronnen.v20230101_v2_csv vvc on (v.identificatie = vvc.pand_bagverblijfsobjectid)
		  left join plllbronnen.plll_uhi u on (st_intersects(v.geopunt, u.geom))
		    left join plllbronnen.cbs_pc6_2020_v1 cbs on (cbs.pc6 = n.postcode)
  group by 
  	v.id,
  	v.identificatie,
  	o.openbareruimtenaam,
  	n.huisnummer,
  	n.huisletter,
  	n.huisnummertoevoeging,
  	n.postcode,
  	w.woonplaatsnaam,
  	typeadresseerbaarobject,
  	v."verblijfsobjectstatus", 
  	oppervlakteverblijfsobject,
	pand_opnamedatum,
	pand_opnametype, 
	pand_status, 
	pand_berekeningstype, 
	pand_energieindex, 
	pand_energieklasse, 
	pand_energielabel_is_prive, 
	pand_is_op_basis_van_referentie_gebouw, 
	pand_gebouwklasse, 
	meting_geldig_tot, 
	pand_registratiedatum, 
	pand_detailaanduiding, 
	pand_gebouwtype, 
	pand_gebouwsubtype, 
	pand_projectnaam, 
	pand_projectobject, 
	pand_sbicode, 
	pand_gebruiksoppervlakte_thermische_zone, 
	pand_energiebehoefte, 
	pand_eis_energiebehoefte, 
	pand_primaire_fossiele_energie, 
	pand_eis_primaire_fossiele_energie, 
	pand_primaire_fossiele_energie_emg_forfaitair, 
	pand_aandeel_hernieuwbare_energie, 
	pand_eis_aandeel_hernieuwbare_energie, 
	pand_aandeel_hernieuwbare_energie_emg_forfaitair, 
	pand_temperatuuroverschrijding, 
	pand_eis_temperatuuroverschrijding, 
	pand_warmtebehoefte, 
	pand_energieindex_met_emg_forfaitair,
	u.temperature,
	cbs.aantal_hh,
	cbs.tothh_eenp,
	cbs.tothh_mpzk,
	cbs.hh_eenoud,
	cbs.hh_tweeoud,
	cbs.gem_hh_gr,
	cbs.p_nl_achtg,
	cbs.p_we_mig_a,
	cbs.p_nw_mig_a,
	cbs.p_koopwon,
	cbs.p_huurwon,
	cbs.won_hcorp,
	cbs.wozwoning,
	uitkminaow,
  	v.geopunt,
  	geom2
 union
select
    s.id,
    s.identificatie,
	openbareruimtenaam,
	huisnummer,
	huisletter,
	huisnummertoevoeging,
	postcode,
	woonplaatsnaam,
	typeadresseerbaarobject,
	standplaatsstatus::text,
	'woonfunctie' gebruiksdoel,
	st_area(s.geovlak) oppervlakteverblijfsobject,
	pand_opnamedatum,
	pand_opnametype, 
	pand_status, 
	pand_berekeningstype, 
	pand_energieindex, 
	pand_energieklasse, 
	pand_energielabel_is_prive, 
	pand_is_op_basis_van_referentie_gebouw, 
	pand_gebouwklasse, 
	meting_geldig_tot, 
	pand_registratiedatum, 
	pand_detailaanduiding, 
	pand_gebouwtype, 
	pand_gebouwsubtype, 
	pand_projectnaam, 
	pand_projectobject, 
	pand_sbicode, 
	pand_gebruiksoppervlakte_thermische_zone, 
	pand_energiebehoefte, 
	pand_eis_energiebehoefte, 
	pand_primaire_fossiele_energie, 
	pand_eis_primaire_fossiele_energie, 
	pand_primaire_fossiele_energie_emg_forfaitair, 
	pand_aandeel_hernieuwbare_energie, 
	pand_eis_aandeel_hernieuwbare_energie, 
	pand_aandeel_hernieuwbare_energie_emg_forfaitair, 
	pand_temperatuuroverschrijding, 
	pand_eis_temperatuuroverschrijding, 
	pand_warmtebehoefte, 
	pand_energieindex_met_emg_forfaitair,
	u.temperature uhi_temperature,
	cbs.aantal_hh cbs_aantal_hh,
	cbs.tothh_eenp cbs_tothh_eenp,
	cbs.tothh_mpzk cbs_tothh_mpzk,
	cbs.hh_eenoud cbs_hh_eenoud,
	cbs.hh_tweeoud cbs_hh_tweeoud,
	cbs.gem_hh_gr cbs_gem_hh_gr,
	cbs.p_nl_achtg cbs_p_nl_achtg,
	cbs.p_we_mig_a cbs_p_we_mig_a,
	cbs.p_nw_mig_a cbs_p_nw_mig_a,
	cbs.p_koopwon cbs_p_koopwon,
	cbs.p_huurwon cbs_p_huurwon,
	cbs.won_hcorp cbs_won_hcorp,
	cbs.wozwoning cbs_wozwoning,
	uitkminaow cbs_uitkminaow,
	st_centroid(s.geovlak) geom,
	st_centroid(s.geovlak) geom2
  from plllbronnen.standplaats s  
    join plllbronnen.nummeraanduiding n2 on (s.hoofdadres = n2.identificatie)
     join plllbronnen.openbareruimte o2 on (n2.gerelateerdeopenbareruimte=o2.identificatie)
      join plllbronnen.woonplaats w2 on (o2.gerelateerdewoonplaats=w2.identificatie)
       left join plllbronnen.v20230101_v2_csv vvc2 on (s.identificatie =vvc2.pand_bagstandplaatsid)
       	left join plllbronnen.plll_uhi u on (st_intersects(st_centroid(s.geovlak), u.geom))
		 left join plllbronnen.cbs_pc6_2020_v1 cbs on (cbs.pc6 = n2.postcode)
  group by 
  	s.id,
  	s.identificatie,
  	o2.openbareruimtenaam,
  	n2.huisnummer,
  	n2.huisletter,
  	n2.huisnummertoevoeging,
  	n2.postcode,
  	w2.woonplaatsnaam,
  	typeadresseerbaarobject,
  	standplaatsstatus,
  	oppervlakteverblijfsobject,
	pand_opnamedatum,
	pand_opnametype, 
	pand_status, 
	pand_berekeningstype, 
	pand_energieindex, 
	pand_energieklasse, 
	pand_energielabel_is_prive, 
	pand_is_op_basis_van_referentie_gebouw, 
	pand_gebouwklasse, 
	meting_geldig_tot, 
	pand_registratiedatum, 
	pand_detailaanduiding, 
	pand_gebouwtype, 
	pand_gebouwsubtype, 
	pand_projectnaam, 
	pand_projectobject, 
	pand_sbicode, 
	pand_gebruiksoppervlakte_thermische_zone, 
	pand_energiebehoefte, 
	pand_eis_energiebehoefte, 
	pand_primaire_fossiele_energie, 
	pand_eis_primaire_fossiele_energie, 
	pand_primaire_fossiele_energie_emg_forfaitair, 
	pand_aandeel_hernieuwbare_energie, 
	pand_eis_aandeel_hernieuwbare_energie, 
	pand_aandeel_hernieuwbare_energie_emg_forfaitair, 
	pand_temperatuuroverschrijding, 
	pand_eis_temperatuuroverschrijding, 
	pand_warmtebehoefte, 
	pand_energieindex_met_emg_forfaitair,
	u.temperature,
	cbs.aantal_hh,
	cbs.tothh_eenp,
	cbs.tothh_mpzk,
	cbs.hh_eenoud,
	cbs.hh_tweeoud,
	cbs.gem_hh_gr,
	cbs.p_nl_achtg,
	cbs.p_we_mig_a,
	cbs.p_nw_mig_a,
	cbs.p_koopwon,
	cbs.p_huurwon,
	cbs.won_hcorp,
	cbs.wozwoning,
	uitkminaow,
  	st_centroid(s.geovlak),
  	geom2
;

--- postcode
drop table if exists postcode;
create sequence if not exists postcodeseq;
alter sequence postcodeseq restart with 1;
create table postcode as
with nummerreeksen as 
(select v2.postcode, v2.openbareruimtenaam || ' ' || min(v2.huisnummer)::text || ' - ' || max(v2.huisnummer) reeks
   from verblijfsobject v2 
     group by v2.postcode, v2.openbareruimtenaam
)
, nummerreeksenagg as 
(
select 
	postcode, 
	string_agg(distinct reeks, ',' order by reeks) reeksen
  from nummerreeksen
  	group by postcode
)
, energielabels as 
(
select v3.postcode, count(v3.pand_energieklasse) aantallabels, v3.pand_energieklasse
  from verblijfsobject v3 
    group by v3.postcode, v3.pand_energieklasse 
      order by postcode, count(v3.pand_energieklasse) desc
)
, energielabelsagg as 
(
select postcode, string_agg(pand_energieklasse || '(' || aantallabels::text || ')', ',' order by aantallabels desc, pand_energieklasse asc) labels
  from energielabels
   group by postcode
)
, postcodebagrvoenergielabels as
(
select 
 v.postcode,
 count(v.identificatie) verblijfsobjecten,
 sum(v.oppervlakteverblijfsobject) verblijfsobjectoppervlak,
 reeksen,
 labels,
 toplabel
  from 
   verblijfsobject v
    join nummerreeksenagg nr on (v.postcode = nr.postcode)
     join energielabelsagg el on (v.postcode = el.postcode)
       join lateral (select pand_energieklasse toplabel from energielabels el where v.postcode = el.postcode order by aantallabels desc, pand_energieklasse asc limit 1) toplabel on true
      group by v.postcode, reeksen, labels, toplabel
)
select
  nextval('postcodeseq') id,
  pc.*,
  kpb.particuliere_eigenaar_bewoner,
  kpb.particuliere_verhuur,
  kpb.woningcorporatie,
  kpb.restcategorie,
  pep.gemiddelde_aardgaslevering_woningen,
  pep.gemiddelde_aardgaslevering_woningen_gecorrigeerd,
  pep.gemiddelde_elektriciteitslevering_woningen,
  pep.gemiddelde_aardgaslevering_bedrijven,
  pep.gemiddelde_elektriciteitslevering_bedrijven,
  k.inwoner,
  k.man,
  k.vrouw,
  k.inw_014,
  k.inw_1524,
  k.inw_2544,
  k.inw_4564,
  k.inw_65pl,
  k.p_nl_achtg,
  k.p_we_mig_a,
  k.p_nw_mig_a,
  k.aantal_hh,
  k.tothh_eenp,
  k.tothh_mpzk,
  k.hh_eenoud,
  k.hh_tweeoud,
  k.gem_hh_gr,
  k.woning,
  k.wonvoor45,
  k.won_4564,
  k.won_6574,
  k.won_7584,
  k.won_8594,
  k.won_9504,
  k.won_0514,
  k.won_1524,
  k.won_mrgez,
  k.p_koopwon,
  k.p_huurwon,
  k.won_hcorp,
  k.won_nbew,
  k.wozwoning,
  k.uitkminaow,
  k.geom,
  null::geometry(multipolygon,28992) geomblok
  from plllbronnen.cbs_pc6_2020_v1 k 
    left join plllbronnen.kadaster_pc6_bezitsverhoudingen kpb on (k.pc6=kpb.postcode) 
      left join postcodebagrvoenergielabels pc on (k.pc6=pc.postcode) 
        left join plllbronnen.publicatiefile_energie_postcode6_2021 pep on (k.pc6=pep.postcode6);

update postcode pc 
   set geomblok=
     (select st_multi(st_union(st_intersection(pc.geom, p.geovlak))) 
	   from plllbronnen.pand p 
	     where st_intersects(pc.geom,p.geovlak));
alter table postcode add primary key (id);
create index postcodegeomidx on postcode using gist(geom);
create index postcodegeomblokidx on postcode using gist(geomblok);


-- spread verblijfsobjecten over postcodeblokken
drop table if exists tempspreadpoints;
create table tempspreadpoints as
with pointdump as
(select 
    vp.gerelateerdpand, 
    pc.postcode,
    array_agg(v.identificatie order by v.openbareruimtenaam,v.huisnummer) verblijfsobjecten,  
    st_dump(st_generatepoints(st_buffer(st_intersection(p.geovlak,pc.geom),-1),count(v.identificatie)::int,1234)) dump 
  from plllbronnen.verblijfsobjectpand vp 
    join verblijfsobject v on (vp.identificatie=v.identificatie)
      join plllbronnen.pand p on (vp.gerelateerdpand=p.identificatie and st_intersects(v.geom,p.geovlak))
	   join postcode pc on (v.postcode=pc.postcode)
		group by p.geovlak,pc.geom,vp.gerelateerdpand,pc.postcode
			having count(vp.gerelateerdpand) > 1)
select 
    row_number() over (partition by gerelateerdpand order by st_y((dump).geom),st_x((dump).geom)),
    gerelateerdpand,
    postcode,
	(dump).geom, 
	(verblijfsobjecten)[row_number() over (partition by gerelateerdpand,postcode)] verblijfsobject
  from pointdump;
update verblijfsobject set geom2=geom where geom2 is null;
update verblijfsobject v set geom2=s.geom from tempspreadpoints s where v.identificatie = s.verblijfsobject;
drop table tempspreadpoints;

CREATE INDEX verblijfsobjectgeomidx ON verblijfsobject USING gist (geom);
CREATE INDEX verblijfsobjectgeom2idx ON verblijfsobject USING gist (geom2);

-- GEBOUW
drop table if exists gebouw;
create table gebouw as
with verblijfsobjectenpand as
(
	select 
	v2.gerelateerdpand,
	v3.*
	 from plllbronnen.verblijfsobjectpand v2 
	   join verblijfsobject v3 on (v2.identificatie=v3.identificatie) 
)
, verblijfsobjectenagg as 
(
	select 
	  vbo1.gerelateerdpand,
	  count(identificatie) verblijfsobjecten,
	  sum(vbo1.oppervlakteverblijfsobject) oppervlakteverblijfsobjecten
	  from verblijfsobjectenpand vbo1
	    group by vbo1.gerelateerdpand
)
, gebouwtypen as 
(
	select
	  vbo2.gerelateerdpand,
	  vbo2.pand_gebouwtype gebouwtype,
	  count(vbo2.pand_gebouwtype) aantal
	  from verblijfsobjectenpand vbo2
	    where vbo2.pand_gebouwtype is not null and trim(vbo2.pand_gebouwtype) <> ''
	    group by vbo2.gerelateerdpand, vbo2.pand_gebouwtype
)
, gebouwtypenagg as 
(
	select 
	  gerelateerdpand,
	  string_agg(gebouwtype || '(' || aantal || ')', ',' order by aantal desc, gebouwtype asc) gebouwtypen
	  from gebouwtypen
	    group by gerelateerdpand
)
, reeksen as (
    select 
    	v4.gerelateerdpand,
	    openbareruimtenaam, 
	    min(huisnummer) vanhuisnummer,
	    max(huisnummer) tothuisnummer,
	    case when min(huisnummer) <> max(huisnummer) then
		    openbareruimtenaam || ' ' || min(huisnummer) || ' - ' || max(huisnummer) 
		    else 
		    openbareruimtenaam || ' ' || min(huisnummer)
		end reeks
	  from 
		verblijfsobjectenpand v4
	        group by v4.gerelateerdpand,v4.openbareruimtenaam 
)
,reeksenagg as (
	select 
	  r.gerelateerdpand,
	  string_agg(r.reeks, ',') nummerreeks
	  from reeksen r
	    group by r.gerelateerdpand
)
,elabels as (
	select 
		v5.gerelateerdpand,
		v5.pand_energieklasse elabel,
		count(v5.pand_energieklasse) elabels
	  from verblijfsobjectenpand v5
	    group by v5.gerelateerdpand, v5.pand_energieklasse
)
,elabelsagg as (
	select 
	el.gerelateerdpand,
	string_agg(el.elabel || '(' || el.elabels || ')', ',' order by el.elabels desc, el.elabel asc) elabels
	 from elabels el
	   group by el.gerelateerdpand
)
,postcodes as (
   select 
     v6.gerelateerdpand,
     v6.postcode,
     count(postcode) postcodes
    from verblijfsobjectenpand v6
      group by v6.gerelateerdpand, postcode
)
,postcodesagg as (
   select 
     pc.gerelateerdpand,
     string_agg(pc.postcode || '(' || pc.postcodes || ')', ',' order by pc.postcodes desc, pc.postcode asc) postcodes
     from postcodes pc
       group by pc.gerelateerdpand
)
,gebouwhoogten as 
(
	select 
	 identificatie,
	 sum((hg.dd_h_dak_50p - hg.h_maaiveld) * st_area(hg.geom)) volume
	  from plllbronnen."2020_hoogtestatistieken_gebouwen" hg 
		group by hg.identificatie 
)
select 
    p.id,
    p.identificatie,
    p.bouwjaar,
    p."pandstatus",
    coalesce(vboa.verblijfsobjecten,0) verblijfsobjecten,
    vboa.oppervlakteverblijfsobjecten,
    gta.gebouwtypen,
    ra.nummerreeks,
    ela.elabels,
    tl.meestvoorkomendelabel,
    pca.postcodes,
    tpc.meestvoorkomendepostcode,
    gh.volume::int,
	case when volume > 0 then ((gh.volume / st_area(geovlak))*10)::int / 10.0 else NULL end gem_hoogte,
    case when volume > 0 then 
  	  case when gh.volume / st_area(geovlak) < 3.1 then 1 else floor((gh.volume/st_area(geovlak))/3.1)::int end
    end gem_bouwlagen,
    case when volume > 0 then
  	  case when gh.volume / st_area(geovlak) < 3.1 then st_area(geovlak)::int else (floor((gh.volume/st_area(geovlak))/3.1)::int * st_area(geovlak))::int end
    end vloeroppervlakte1,
    case when volume > 0 then
  	  case when gh.volume / st_area(geovlak) < 3.1 then st_area(geovlak)::int else (gh.volume/3.1)::int end
    end vloeroppervlakte2,
    p.geovlak geom
  from plllbronnen.pand p
  left join reeksenagg ra on (p.identificatie=ra.gerelateerdpand)
  left join verblijfsobjectenagg vboa on (p.identificatie=vboa.gerelateerdpand)
  left join gebouwtypenagg gta on (p.identificatie=gta.gerelateerdpand)
  left join elabelsagg ela on (p.identificatie=ela.gerelateerdpand)
  left join postcodesagg pca on (p.identificatie=pca.gerelateerdpand)
  left join gebouwhoogten gh on (p.identificatie=gh.identificatie)
   left join lateral (
      select elabel meestvoorkomendelabel from elabels 
        where elabels.gerelateerdpand=p.identificatie
          order by elabels desc, elabel asc
            limit 1
   ) tl on true
    left join lateral (
   	  select postcode meestvoorkomendepostcode from postcodes 
   	    where postcodes.gerelateerdpand=p.identificatie 
   	      order by postcodes desc, postcode asc 
   	        limit 1
   ) tpc on true;
  
  create index gebouwgeomidx on gebouw using gist(geom);