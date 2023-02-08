#!/bin/bash

#to prevent copying 95 GB data, create the PLLL dakvlakken tabel in the pico database, then export to plllbronnen


export PGHOST=leda.geodan.nl

psql -d research -c "drop table if exists plllbronnen.dakdelen;"
psql -d pico -c "create schema if not exists plllbronnen;drop table if exists plllbronnen.cbs_buurten;drop table if exists plllbronnen.dakdelen;"
pg_dump -d research -t plllbronnen.cbs_buurten > cbs_buurten.sql
psql -d pico < cbs_buurten.sql
psql -d pico -c "create table plllbronnen.dakdelen as select distinct d.* from dakdelen_2018.dakdelen d join (select st_union(geom) geom from plllbronnen.cbs_buurten) b on (st_intersects(b.geom, d.geom));"
pg_dump -d pico -t plllbronnen.dakdelen | gzip > dakdelen.sql.gz
zcat dakdelen.sql.gz | psql -d research 
rm cbs_buurten.sql
rm dakdelen.sql.gz
psql -d pico -c "drop table if exists plllbronnen.cbs_buurten;drop table if exists plllbronnen.dakdelen;drop schema if exists plllbronnen;"
psql -d research -c "create index if not exists dakdelen_geom_idx on plllbronnen.dakdelen using gist (geom);"
echo table plllbronnen.dakdelen updated