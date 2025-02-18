FROM public.ecr.aws/lambda/nodejs:22-arm64

WORKDIR /var/task
COPY . .

# Move 'packages/' from build context
COPY packages/ /home/shanu/.local/share/echogarden/packages
RUN rm -rf packages
RUN chmod -R +x /home/shanu/.local/share/echogarden/packages/

CMD ["dist/lambda.handler"]
