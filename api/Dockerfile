FROM wrenchproject/wrench:unstable
USER root

COPY requirements.txt .

RUN pip install --break-system-packages -r requirements.txt

RUN apt-get update && apt-get install -y git

RUN apt-get install -y cron

RUN mkdir -p /data/github

RUN git clone https://github.com/wfcommons/WfInstances.git /data/github

ARG WFINSTANCES_CRAWL_PERIOD_IN_DAYS

RUN echo "0 * * * * cd /data/github && git pull origin main" > /etc/cron.d/git-pull-repo

RUN chmod 0644 /etc/cron.d/git-pull-repo

RUN crontab /etc/cron.d/git-pull-repo

# Install WRENCH API v0.4
RUN apt-get -y install zip
RUN python3 -m pip install --break-system-packages build
RUN wget https://github.com/wrench-project/wrench-python-api/archive/refs/tags/v0.4.zip; unzip v0.4.zip; cd wrench-python-api-0.4; python3 -m build; python3 -m pip install --break-system-packages ./dist/wrench-*.whl

# Intall IPInfo
RUN python3 -m pip install --break-system-packages ipinfo

COPY . .

#CMD cron && uvicorn src.main:app --host 0.0.0.0 --port 8081
CMD cron && bash ./run_uvicorn_and_wrench_daemon.bash
