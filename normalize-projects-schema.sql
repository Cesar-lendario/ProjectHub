-- =====================================================
-- SCRIPT: Normalizar colunas da tabela projects (snake_case)
-- Objetivo: alinhar o schema com o contrato usado pelo PostgREST/Frontend
-- =====================================================
DO $$
BEGIN
    -- start_date
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'startDate'
    ) THEN
        EXECUTE 'ALTER TABLE public.projects RENAME COLUMN "startDate" TO start_date';
    END IF;

    -- end_date
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'endDate'
    ) THEN
        EXECUTE 'ALTER TABLE public.projects RENAME COLUMN "endDate" TO end_date';
    END IF;

    -- project_type (camel case) -> project_type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'projectType'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'project_type'
        ) THEN
            EXECUTE 'UPDATE public.projects SET project_type = COALESCE(project_type, projectType::text)';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN "projectType"';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN "projectType" TO project_type';
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'projecttype'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'project_type'
        ) THEN
            EXECUTE 'UPDATE public.projects SET project_type = COALESCE(project_type, projecttype::text)';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN projecttype';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN projecttype TO project_type';
        END IF;
    END IF;

    -- client_name
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'clientName'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'client_name'
        ) THEN
            EXECUTE 'UPDATE public.projects SET client_name = COALESCE(client_name, "clientName")';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN "clientName"';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN "clientName" TO client_name';
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'clientname'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'client_name'
        ) THEN
            EXECUTE 'UPDATE public.projects SET client_name = COALESCE(client_name, clientname)';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN clientname';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN clientname TO client_name';
        END IF;
    END IF;

    -- client_email
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'clientEmail'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'client_email'
        ) THEN
            EXECUTE 'UPDATE public.projects SET client_email = COALESCE(client_email, "clientEmail")';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN "clientEmail"';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN "clientEmail" TO client_email';
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'clientemail'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'client_email'
        ) THEN
            EXECUTE 'UPDATE public.projects SET client_email = COALESCE(client_email, clientemail)';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN clientemail';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN clientemail TO client_email';
        END IF;
    END IF;

    -- Remover colunas de custo real
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'actualCost'
    ) THEN
        EXECUTE 'ALTER TABLE public.projects DROP COLUMN "actualCost"';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'actualcost'
    ) THEN
        EXECUTE 'ALTER TABLE public.projects DROP COLUMN actualcost';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'actual_cost'
    ) THEN
        EXECUTE 'ALTER TABLE public.projects DROP COLUMN actual_cost';
    END IF;

    -- Remover colunas de orçamento
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'budget'
    ) THEN
        EXECUTE 'ALTER TABLE public.projects DROP COLUMN budget';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'Budget'
    ) THEN
        EXECUTE 'ALTER TABLE public.projects DROP COLUMN "Budget"';
    END IF;

    -- last_email_notification
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'lastEmailNotification'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'last_email_notification'
        ) THEN
            EXECUTE 'UPDATE public.projects SET last_email_notification = COALESCE(last_email_notification, "lastEmailNotification")';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN "lastEmailNotification"';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN "lastEmailNotification" TO last_email_notification';
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'lastemailnotification'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'last_email_notification'
        ) THEN
            EXECUTE 'UPDATE public.projects SET last_email_notification = COALESCE(last_email_notification, lastemailnotification)';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN lastemailnotification';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN lastemailnotification TO last_email_notification';
        END IF;
    END IF;

    -- last_whatsapp_notification
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'lastWhatsappNotification'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'last_whatsapp_notification'
        ) THEN
            EXECUTE 'UPDATE public.projects SET last_whatsapp_notification = COALESCE(last_whatsapp_notification, "lastWhatsappNotification")';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN "lastWhatsappNotification"';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN "lastWhatsappNotification" TO last_whatsapp_notification';
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'lastwhatsappnotification'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'last_whatsapp_notification'
        ) THEN
            EXECUTE 'UPDATE public.projects SET last_whatsapp_notification = COALESCE(last_whatsapp_notification, lastwhatsappnotification)';
            EXECUTE 'ALTER TABLE public.projects DROP COLUMN lastwhatsappnotification';
        ELSE
            EXECUTE 'ALTER TABLE public.projects RENAME COLUMN lastwhatsappnotification TO last_whatsapp_notification';
        END IF;
    END IF;

    -- =====================================================
    -- Normalizar tabela tasks
    -- =====================================================
    -- project_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'projectId'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'project_id'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET project_id = COALESCE(project_id, "projectId")';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN "projectId"';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN "projectId" TO project_id';
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'projectid'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'project_id'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET project_id = COALESCE(project_id, projectid)';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN projectid';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN projectid TO project_id';
        END IF;
    END IF;

    -- assignee_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'assigneeId'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'assignee_id'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET assignee_id = COALESCE(assignee_id, "assigneeId")';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN "assigneeId"';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN "assigneeId" TO assignee_id';
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'assigneeid'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'assignee_id'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET assignee_id = COALESCE(assignee_id, assigneeid)';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN assigneeid';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN assigneeid TO assignee_id';
        END IF;
    END IF;

    -- due_date
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'dueDate'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'due_date'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET due_date = COALESCE(due_date, "dueDate")';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN "dueDate"';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN "dueDate" TO due_date';
        END IF;
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'duedate'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'due_date'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET due_date = COALESCE(due_date, duedate)';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN duedate';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN duedate TO due_date';
        END IF;
    END IF;

    -- status
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'taskStatus'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'status'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET status = COALESCE(status, "taskStatus")';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN "taskStatus"';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN "taskStatus" TO status';
        END IF;
    END IF;

    -- priority
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'priorityLevel'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'priority'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET priority = COALESCE(priority, "priorityLevel")';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN "priorityLevel"';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN "priorityLevel" TO priority';
        END IF;
    END IF;

    -- duration
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'durationDays'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'duration'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET duration = COALESCE(duration, "durationDays")';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN "durationDays"';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN "durationDays" TO duration';
        END IF;
    END IF;

    -- dependencies (garantir coluna)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'dependencies'
    ) THEN
        EXECUTE 'ALTER TABLE public.tasks ADD COLUMN dependencies TEXT[] DEFAULT ''{}''';
    END IF;
    -- garantir default corretamente configurado
    EXECUTE 'ALTER TABLE public.tasks ALTER COLUMN dependencies SET DEFAULT ''{}''::text[]';

    -- created_at / updated_at (renomear variantes camelCase)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'createdAt'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'created_at'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET created_at = COALESCE(created_at, "createdAt")';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN "createdAt"';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN "createdAt" TO created_at';
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'updatedAt'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'updated_at'
        ) THEN
            EXECUTE 'UPDATE public.tasks SET updated_at = COALESCE(updated_at, "updatedAt")';
            EXECUTE 'ALTER TABLE public.tasks DROP COLUMN "updatedAt"';
        ELSE
            EXECUTE 'ALTER TABLE public.tasks RENAME COLUMN "updatedAt" TO updated_at';
        END IF;
    END IF;

END $$;

-- Reaplicar comentários principais (idempotentes)
COMMENT ON COLUMN public.projects.client_email IS
'Email do contato do projeto. Utilizado para notificações e comunicação.';


