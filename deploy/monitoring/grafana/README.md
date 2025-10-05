Grafana provisioning
---------------------

Place the datasources and dashboards under the `provisioning` and `dashboards` folders. Mount these into the Grafana container at `/etc/grafana/provisioning` for provisioning and `/var/lib/grafana/dashboards` for dashboard JSON files.

Example docker-compose service (snippet):

```yaml
  grafana:
    image: grafana/grafana:9
    volumes:
      - ./provisioning:/etc/grafana/provisioning
      - ./dashboards:/var/lib/grafana/dashboards/hafjet
```
