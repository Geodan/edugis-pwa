-- pc6 locations
-- host: leda.geodan.nl
-- db: research
create table plll.pc6points as
with pc6centroids as
(select st_centroid(st_union(st_force2d(a.geopunt))) punt, count(postcode) adressen, postcode 
  from bag_laatst.adres a join plll.wijken w2 on (st_intersects(a.geopunt, w2.geom ))
 	group by postcode)
select c.postcode, c.adressen,a3.geom 
  from pc6centroids c 
cross join lateral (select 
    st_force2d(a2.geopunt) geom from 
      bag_laatst.adres a2 order by a2.geopunt <-> c.punt limit 1) a3;
