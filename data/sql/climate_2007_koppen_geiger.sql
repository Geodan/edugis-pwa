
-- download geojson from https://ggis.un-igrac.org/layers/igrac:other_climate_2007_koppen_geiger
-- and import using http://tiles.edugis.nl:8090 file upload

-- remove identity to save space, add columns:
-- klassificatie,klimaat,neerslagverdeling,temperatuurverschil,droogseizoen
create table climate_2007_koppen_geiger as 
  select ogc_fid, geom, climate, substring(climate from '^([A-Z,a-z]*)') klassificatie, 
   case when substring(climate from '^[A-E]') = 'A' then 'Tropisch Klimaat' 
        when substring(climate from '^[A-E]') = 'B' then 'Droog Klimaat' 
        when substring(climate from '^[A-E]') = 'C' then 'Gematigd Klimaat'
        when substring(climate from '^[A-E]') = 'D' then 'Landklimaat' 
        when substring(climate from '^[A-E]') = 'E' then 'Poolklimaat' 
   end klimaat,
   case when substring(climate from '^A([A-Z,a-z])') = 'f' then 'regenwoud'
        when substring(climate from '^A([A-Z,a-z])') = 'm' then 'moesson'
        when substring(climate from '^A([A-Z,a-z])') = 'w' then 'savanne'
        when substring(climate from '^A([A-Z,a-z])') = 's' then 'savanne'
        when substring(climate from '^B([A-Z,a-z])') = 'S' then 'steppe'
        when substring(climate from '^B([A-Z,a-z])') = 'W' then 'woestijn'
        when substring(climate from '^.([A-Z,a-z])') = 's' then 'droge zomer'
        when substring(climate from '^.([A-Z,a-z])') = 'w' then 'droge winter'
        when substring(climate from '^.([A-Z,a-z])') = 'f' then 'zonder droog seizoen'
        when substring(climate from '^.([A-Z,a-z])') = 'T' then 'toendra'
        when substring(climate from '^.([A-Z,a-z])') = 'F' then 'ijskap'
        when substring(climate from '^.([A-Z,a-z])') = 'H' then 'hooggebergte'
   end neerslagverdeling,
   case when substring(climate from '^B.([h-k])') = 'h' then 'heet'
        when substring(climate from '^B.([h-k])') = 'k' then 'koud'
        when substring(climate from '^C.([a-c])') = 'a' then 'warme zomer'
        when substring(climate from '^C.([a-c])') = 'b' then 'gematigde zomer'
        when substring(climate from '^C.([a-c])') = 'c' then 'koele zomer'
        when substring(climate from '^D.([a-d])') = 'a' then 'hete zomer'
        when substring(climate from '^D.([a-d])') = 'b' then 'warme zomer'
        when substring(climate from '^D.([a-d])') = 'c' then 'koele zomer'
        when substring(climate from '^D.([a-d])') = 'd' then 'erg koude winter'
   end temperatuurverschil,
   case when substring(climate from '^B..([s-w])') = 's' then 'droog in zomer'
        when substring(climate from '^B..([s-w])') = 'w' then 'droog in winter'
   end droogseizoen
     from other_climate_2007_koppen_geiger ockg ;
create index climate_2007_koppen_geiger_geomidx on climate_2007_koppen_geiger using gist(geom);

-- replace 'Dfa' by 'Dfd' for part of north east siberia
update climate_2007_koppen_geiger set klassificatie='Dfd', temperatuurverschil='erg koude winter' where st_intersects(geom,st_setsrid(st_makepoint(117.2,66.7),4326));
-- remove south pole point, cannot be projected on mercator (point => line)
update climate_2007_koppen_geiger set geom=st_multi(st_intersection(geom, st_makeenvelope(-180,0,180,-89.5,4326))) where st_ymin(geom) = -90 ;
-- add missing mountain areas
insert into climate_2007_koppen_geiger (geom, klassificatie, klimaat, neerslagverdeling)
with mountains as
(select st_difference(st_makeenvelope(78.4,29.8,105.1,39.3,4326), st_union(geom)) geom from other_climate_2007_koppen_geiger ockg where st_intersects(geom,st_makeenvelope(78.4,29.8,105.1,39.3,4326)))
 select geom, 'EH' as klassificatie, 'Poolklimaat' as klimaat, 'Hooggebergte' as neerslagverdeling from mountains;