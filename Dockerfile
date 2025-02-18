FROM public.ecr.aws/lambda/nodejs:22-arm64

WORKDIR /var/task

COPY package*.json ./
RUN npm ci --production

# Copy everything except 'packages/' (handled by .dockerignore)
COPY . .

# Move 'packages/' from build context
COPY packages/ /root/.local/share/echogarden/packages
RUN rm -rf packages

# Ensure executable permissions for the 'packages/' directory if needed
RUN chmod -R +x /root/.local/share/echogarden/packages/

# Copy the entrypoint script to the container and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set permissions for /tmp
RUN chmod 1777 /tmp

# Set the entrypoint to the script
ENTRYPOINT ["/entrypoint.sh"]
