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
	geopunt geom,
	null::geometry(point,28992) geom2
  from plllbronnen.verblijfsobject v   
    join plllbronnen.nummeraanduiding n on (v.hoofdadres = n.identificatie)
     join plllbronnen.openbareruimte o on (n.gerelateerdeopenbareruimte=o.identificatie)
      join plllbronnen.woonplaats w on (o.gerelateerdewoonplaats=w.identificatie)
       join plllbronnen.verblijfsobjectgebruiksdoel d on (v.identificatie=d.identificatie)
		left join plllbronnen.v20230101_v2_csv vvc on (v.identificatie = vvc.pand_bagverblijfsobjectid)
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
  	geom,
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
	st_centroid(s.geovlak) geom,
	st_centroid(s.geovlak) geom2
  from plllbronnen.standplaats s  
    join plllbronnen.nummeraanduiding n2 on (s.hoofdadres = n2.identificatie)
     join plllbronnen.openbareruimte o2 on (n2.gerelateerdeopenbareruimte=o2.identificatie)
      join plllbronnen.woonplaats w2 on (o2.gerelateerdewoonplaats=w2.identificatie)
       left join plllbronnen.v20230101_v2_csv vvc2 on (s.identificatie =vvc2.pand_bagstandplaatsid)
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
  	geom,
  	geom2
;

drop table if exists tempspreadpoints;
create table tempspreadpoints as
with pointdump as
(select 
    vp.gerelateerdpand, 
    array_agg(v.identificatie order by v.openbareruimtenaam,v.huisnummer) verblijfsobjecten,  
    st_dump(st_generatepoints(st_buffer(p.geovlak,-1),count(v.identificatie)::int,1234)) dump 
  from plllbronnen.verblijfsobjectpand vp 
    join verblijfsobject v on (vp.identificatie=v.identificatie)
      join plllbronnen.pand p on (vp.gerelateerdpand=p.identificatie and st_intersects(v.geom,p.geovlak))
		group by p.geovlak,vp.gerelateerdpand
			having count(vp.gerelateerdpand) > 1)
select 
    row_number() over (partition by gerelateerdpand order by st_y((dump).geom),st_x((dump).geom)),
    gerelateerdpand, 
	(dump).geom, 
	(verblijfsobjecten)[row_number() over (partition by gerelateerdpand)] verblijfsobject
  from pointdump;
update verblijfsobject set geom2=geom where geom2 is null;
update verblijfsobject v set geom2=s.geom from tempspreadpoints s where v.identificatie = s.verblijfsobject;
drop table tempspreadpoints;

CREATE INDEX verblijfsobjectgeomidx ON plllbronnen.verblijfsobject USING gist (geom);
CREATE INDEX verblijfsobjectgeom2idx ON plllbronnen.verblijfsobject USING gist (geom2);


--- postcode
drop table if exists postcode;
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
  pc.*,
  kpb.particuliere_eigenaar_bewoner,
  kpb.particuliere_verhuur,
  kpb.woningcorporatie,
  kpb.restcategorie,
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
  from postcodebagrvoenergielabels pc
   left join plllbronnen.cbs_pc6_2020_v1 k on (k.pc6=pc.postcode)
     left join plllbronnen.kadaster_pc6_bezitsverhoudingen kpb on (pc.postcode=kpb.postcode);

 update postcode pc 
   set geomblok=
     (select st_multi(st_union(st_intersection(pc.geom, p.geovlak))) 
	   from plllbronnen.pand p 
	     where st_intersects(pc.geom,p.geovlak));