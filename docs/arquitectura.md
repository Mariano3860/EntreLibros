# Arquitectura de despliegue

```mermaid
---
config:
  layout: dagre
  look: neo
  theme: redux
---
flowchart TB
 subgraph DockerPub["Docker (Container)"]
        Nginx["Traffic router<br>nginx:latest"]
  end
 subgraph EC2Pub["EC2 instance (public)"]
        DockerPub
  end
 subgraph Public["Public subnet"]
        NAT["NAT gateway"]
        EC2Pub
        Conf["Conf/Certs"]
  end
 subgraph DockerPriv["Docker (Containers)"]
        DB["Database<br>postgis/postgis:15-master"]
        BE["Backend<br>Node.js/Express<br>backend:latest"]
        FE["Frontend<br>React app<br>frontend:latest"]
  end
 subgraph EC2Priv["EC2 instance (private)"]
        DockerPriv
        VolDB["/var/lib/data/psql"]
        VolStatic["StaticFiles"]
  end
 subgraph Private["Private subnet"]
        EC2Priv
  end
 subgraph AZ1["Availability Zone 1"]
        Public
        Private
  end
 subgraph VPC["Virtual Private Cloud (VPC)"]
        IGW["Internet gateway"]
        S3["Object Storage<br>S3"]
        AZ1
  end
 subgraph Region["Region"]
        VPC
  end
 subgraph AWS["AWS Cloud"]
        Region
  end
    BE -- S3 SDK / presigned --> S3
    Internet(("Internet")) --> IGW
    Nginx -- HTTP 8000 security group --> BE
    Nginx -- serve static / --> FE
    BE -- 5432 --> DB
    DB -. volume .-> VolDB
    FE -. static files .-> VolStatic
    Conf -. mounted .-> Nginx
    EC2Priv --> NAT
    NAT --> IGW
    Nginx --> IGW
    FE --> BE
```

A nivel de red, la VPC establece el perímetro con Internet Gateway en el borde y NAT Gateway para salida controlada desde la subred privada.

En la subred pública:
- Una EC2 con nginx expone 443/HTTPS.
- Monta Conf/Certs (cadena TLS, clave y config).
- Oficia de reverse proxy: rutea las solicitudes a la API interna por HTTP 8000 según security groups que limitan origen y puerto (ingress 443 abierto hacia Internet; egress desde nginx únicamente al SG del backend en 8000).
- Publica el build del frontend en “/”, descargando al backend de servir estáticos.

En la subred privada corre una EC2 con Docker que orquesta tres contenedores:
- **Backend** (Node.js/Express, backend:latest): implementa la lógica de negocio y el acceso a datos, mantiene conexiones con PostgreSQL/PostGIS por TCP 5432 y genera presigned URLs para S3, permitiendo upload/download directo desde el navegador sin exponer credenciales ni forzar a la API a transportar binarios.
- **Base de datos** (postgis/postgis:15-master): opera con tipos e índices geoespaciales (p.ej., geography/geometry + GiST) para consultas por proximidad y persiste en /var/lib/postgresql/data mediante un volumen de Docker, evitando pérdida de datos ante redeploy.
- **Frontend** (frontend:latest): se limita a producir artefactos estáticos listos para CDN o para el propio nginx del borde.

Este recorte entre borde, cómputo y datos mantiene superficies limpias y reglas simples de circulación:
- Nada de servicios de negocio de cara a Internet fuera de nginx.
- Puertos internos mínimos y explícitos.
En cuanto al flujo, el cliente entra por IGW → nginx (443); nginx valida y reenvía a backend (8000, privado). La API procesa operaciones transaccionales y geoespaciales contra Postgres (5432), y cuando hay intercambio de archivos solicita a S3 una URL prefirmada con vencimiento y restricciones de método/tipo de contenido; el navegador usa esa URL para subir/bajar directamente al bucket, mientras la API guarda solo los metadatos necesarios. La subred privada no es alcanzable desde Internet; el mantenimiento se hace por túneles (p.ej., SSM Session Manager), sin abrir 8000 ni 5432 al exterior. El esquema aplica menor privilegio (único servicio público: nginx), reduce acoples entre camino transaccional y manejo de binarios, y queda listo para escalar horizontalmente (réplicas del backend detrás del mismo proxy y/o externalización definitiva de estáticos vía S3/CloudFront) sin tocar el modelo de seguridad ni la semántica de puertos.
