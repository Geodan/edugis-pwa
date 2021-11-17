-- download tif data from https://www.worldclim.org/data/worldclim21.html, bio climatic variables 2.5 minutes (bio 2.5m)
-- setup postgis
--  docker run --rm -ti -e POSTGRES_PASS=postgres -v d:\data\kartoza\postgisdb:/var/lib/postgresql -v d:\data\kartoza:/var/local -p 5432:5432 --name postgis kartoza/postgis:13-3.1
-- shell in docker postgis container
--  docker exec -ti postgis /bin/bash
--   apt update
--   apt install -y postgis
--   #import into postgis:
--   raster2pgsql -d -t 256x256 -I /var/local/wc2_1_2_5m_bio_12.tif wc2_1_2_5m_bio_12 | psql -U postgres -h localhost gis
--   #get histogram for data
with hist as
    (select st_histogram(st_union(rast), 1, 15, ARRAY[20,30,60,70,80,80,100,100,140,320,500,1000,1000,1000,5000]) as hist from wc2_1_2_5m_bio_12 w)
 select (hist).* from hist;

drop table if exists wc2_1_2_5m_bio_12_vec;
create table wc2_1_2_5m_bio_12_vec as
 with unionedrast as
 (select st_union(rast) rast from wc2_1_2_5m_bio_12),
 newrast as
  (select st_reclass(rast, 1,'[0-20):10,[20-50):35,[50-110):85,[110-180):150,[180-260):220,[260-340):300,[340-440):400,[440-540):500,[540-680):600,[680-1000):800,[1000-1500):1250,[1500-2500):2000,[2500-3500):3000,[3500-4500):4000,[4500-11191]:6000','16BUI', st_bandnodatavalue(rast)) rast
    from unionedrast w),
vectorval as
  (select (st_dumpaspolygons(rast,1,true)) polygons from newrast),
vector as
  (select (polygons).geom geom, (polygons).val annualprecipitation from vectorval),
stats as
(select vector.geom, vector.annualprecipitation, st_summarystats(st_clip(st_union(r.rast),vector.geom, true)) stats 
      from vector, wc2_1_2_5m_bio_12 r where st_intersects(vector.geom, r.rast) 
    --  and st_intersects(vector.geom, st_makeenvelope(28.3327,36.8953,35.5,42.3,4326)) 
        group by vector.geom,vector.annualprecipitation
    )
select geom, annualprecipitation, (stats).mean, (stats).stddev,(stats).min, (stats).max from stats;
-- remove south pole point from data because of epsg:3857 transformation problems
update wc2_1_2_5m_bio_12_vec set geom=st_collectionextract(st_intersection(geom, st_makeenvelope(-180,0,180,-89.5,4326)),3) where st_ymin(geom) = -90 ;
create index wc2_1_2_5m_bio_12_vecgeomidx on wc2_1_2_5m_bio_12_vec using gist(geom);
