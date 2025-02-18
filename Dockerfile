FROM public.ecr.aws/lambda/nodejs:22-arm64

WORKDIR /var/task

COPY package*.json ./
RUN npm ci --production

# Copy everything except 'packages/' (handled by .dockerignore)
COPY . .

# Move 'packages/' from build context
COPY packages/ /root/.local/share/echogarden/packages
RUN rm -rf packages
RUN chmod -R +x /root/.local/share/echogarden/packages/
RUN chmod +x entrypoint.sh
RUN chmod 1777 /tmp
ENTRYPOINT ["entrypoint.sh"]
